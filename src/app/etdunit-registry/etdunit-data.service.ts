import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { createSelector, select, Store } from '@ngrx/store';
import { Observable, zip as observableZip } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AppState } from '../app.reducer';
import { NotificationsService } from '../shared/notifications/notifications.service';
import { FollowLinkConfig } from '../shared/utils/follow-link-config.model';
import { RemoteDataBuildService } from '../core/cache/builders/remote-data-build.service';
import { RequestParam } from '../core/cache/models/request-param.model';
import { ObjectCacheService } from '../core/cache/object-cache.service';
import { DSOChangeAnalyzer } from '../core/data/dso-change-analyzer.service';
import { PaginatedList } from '../core/data/paginated-list.model';
import { RemoteData } from '../core/data/remote-data';
import { DeleteRequest, PostRequest } from '../core/data/request.models';

import { RequestService } from '../core/data/request.service';
import { HttpOptions } from '../core/dspace-rest/dspace-rest.service';
import { HALEndpointService } from '../core/shared/hal-endpoint.service';
import { Collection } from '../core/shared/collection.model';
import { DSONameService } from '../core/breadcrumbs/dso-name.service';
import { NoContent } from '../core/shared/NoContent.model';
import { FindListOptions } from '../core/data/find-list-options.model';
import { ETDUNIT } from './models/etdunit.resource-type';
import { EtdUnit } from './models/etdunit.model';
import { EtdUnitRegistryState } from './etdunit-registry.reducers';
import { IdentifiableDataService } from '../core/data/base/identifiable-data.service';
import { dataService } from '../core/data/base/data-service.decorator';
import { CreateData, CreateDataImpl } from '../core/data/base/create-data';
import { SearchData, SearchDataImpl } from '../core/data/base/search-data';
import { PatchData, PatchDataImpl } from '../core/data/base/patch-data';
import { DeleteData, DeleteDataImpl } from '../core/data/base/delete-data';
import { EtdUnitRegistryCancelUnitAction, EtdUnitRegistryEditEtdUnitAction } from './etdunit-registry.actions';
import { Operation } from 'fast-json-patch';
import { RestRequestMethod } from '../core/data/rest-request-method';

const etdunitRegistryStateSelector = (state: AppState) => state.etdunitRegistry;
const editEtdUnitSelector = createSelector(etdunitRegistryStateSelector, (etdunitRegistryState: EtdUnitRegistryState) => etdunitRegistryState.editEtdUnit);

/**
 * Provides methods to retrieve eperson etdunit resources from the REST API and
 * EtdUnit related CRUD actions.
 */
@Injectable()
@dataService(ETDUNIT)
export class EtdUnitDataService extends IdentifiableDataService<EtdUnit> {
  protected browseEndpoint = '';
  public collectionsEndpoint = 'collections';

  private createData: CreateData<EtdUnit>;
  private searchData: SearchData<EtdUnit>;
  private patchData: PatchData<EtdUnit>;
  private deleteData: DeleteData<EtdUnit>;

  constructor(
    protected comparator: DSOChangeAnalyzer<EtdUnit>,
    protected http: HttpClient,
    protected notificationsService: NotificationsService,
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<any>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected nameService: DSONameService,
  ) {
    super('etdunits', requestService, rdbService, objectCache, halService);

    this.createData = new CreateDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, notificationsService, this.responseMsToLive);
    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
    this.patchData = new PatchDataImpl<EtdUnit>(this.linkPath, requestService, rdbService, objectCache, halService, comparator, this.responseMsToLive, this.constructIdEndpoint);
    this.deleteData = new DeleteDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, notificationsService, this.responseMsToLive, this.constructIdEndpoint);
  }

  /**
   * Returns a search result list of etdunits, with certain query (searches in collection name and by exact uuid)
   * Endpoint used: /etdunits/search/byMetadata?query=<:name>
   * @param query                       search query param
   * @param options
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  public searchEtdUnits(query: string, options?: FindListOptions, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<EtdUnit>[]): Observable<RemoteData<PaginatedList<EtdUnit>>> {
    const searchParams = [new RequestParam('query', query)];
    let findListOptions = new FindListOptions();
    if (options) {
      findListOptions = Object.assign(new FindListOptions(), options);
    }
    if (findListOptions.searchParams) {
      findListOptions.searchParams = [...findListOptions.searchParams, ...searchParams];
    } else {
      findListOptions.searchParams = searchParams;
    }
    return this.searchBy('byMetadata', findListOptions, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }

  /**
   * Fetches the endpoint used for mapping an item to a collection,
   * or for fetching all collections the item is mapped to if no collection is provided
   * @param itemId        The item's id
   * @param collectionId  The collection's id (optional)
   */
  public getMappedCollectionsEndpoint(itemId: string, collectionId?: string): Observable<string> {
    return this.halService.getEndpoint(this.linkPath).pipe(
      map((endpoint: string) => this.getIDHref(endpoint, itemId)),
      map((endpoint: string) => `${endpoint}/collections${collectionId ? `/${collectionId}` : ''}`),
    );
  }

  /**
   * Adds given collection to given etdunit
   * @param activeEtdUnit EtdUnit we want to add member to
   * @param collection collection we want to add to given activeEtdUnit
   */
  addCollectionToEtdUnit(activeEtdUnit: EtdUnit, collectionUrl: Observable<string>): Observable<RemoteData<NoContent>> {
    const requestId = this.requestService.generateRequestId();
    const options: HttpOptions = Object.create({});
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'text/uri-list');
    options.headers = headers;
    collectionUrl.subscribe(url => {
      const postRequest = new PostRequest(
        requestId,
        activeEtdUnit.self + '/' + this.collectionsEndpoint,
        url,
        options);
      this.requestService.send(postRequest);
    });

    return this.rdbService.buildFromRequestUUIDAndAwait(requestId, () => observableZip(
      this.invalidateByHref(activeEtdUnit._links.self.href),
      this.requestService.setStaleByHrefSubstring(activeEtdUnit._links.collections.href).pipe(take(1)),
    ));
  }

  /**
   * Deletes a given Collection from given active etdunit
   * @param activeEtdUnit EtdUnit we want to delete member from
   * @param collection Collection we want to delete from members of given activeCollection
   */
  deleteCollectionFromEtdUnit(activeEtdUnit: EtdUnit, collection: Collection): Observable<RemoteData<NoContent>> {
    return this.deleteCollectionIdFromEtdUnit(activeEtdUnit, collection.id);
  }

  /**
   * Deletes a given Collection from given active etdunit
   * @param activeEtdUnit EtdUnit we want to delete member from
   * @param collectionId Collection we want to delete from members of given activeCollection
   */
  deleteCollectionIdFromEtdUnit(activeEtdUnit: EtdUnit, collectionId: string): Observable<RemoteData<NoContent>> {
    const requestId = this.requestService.generateRequestId();
    const deleteRequest = new DeleteRequest(requestId, activeEtdUnit.self + '/' + this.collectionsEndpoint + '/' + collectionId);
    this.requestService.send(deleteRequest);

    return this.rdbService.buildFromRequestUUIDAndAwait(requestId, () => observableZip(
      this.invalidateByHref(activeEtdUnit._links.self.href),
      this.requestService.setStaleByHrefSubstring(activeEtdUnit._links.collections.href).pipe(take(1)),
    ));
  }

  /**
   * Method to retrieve the etdunit that is currently being edited
   */
  public getActiveEtdUnit(): Observable<EtdUnit> {
    return this.store.pipe(select(editEtdUnitSelector));
  }

  /**
   * Method to cancel editing a etdunit, dispatches a cancel etdunit action
   */
  public cancelEditEtdUnit() {
    this.store.dispatch(new EtdUnitRegistryCancelUnitAction());
  }

  /**
   * Method to set the etdunit being edited, dispatches an edit etdunit action
   * @param etdunit The EtdUnit to edit
   */
  public editEtdUnit(etdunit: EtdUnit) {
    this.store.dispatch(new EtdUnitRegistryEditEtdUnitAction(etdunit));
  }

  /**
   * Method that clears a cached etdunits request
   */
  public clearUnitsRequests(): void {
    this.getBrowseEndpoint().pipe(take(1)).subscribe((link: string) => {
      this.requestService.removeByHrefSubstring(link);
    });
  }

  /**
   * Method that clears a cached collections request
   */
  public clearCollectionLinkRequests(href: string): void {
    this.requestService.setStaleByHrefSubstring(href);
  }

  public getEtdUnitRegistryRouterLink(): string {
    return '/etdunits';
  }

  /**
   * Get Edit page of etdunit
   * @param etdunit EtdUnit we want edit page for
   */
  public getEtdUnitEditPageRouterLink(etdunit: EtdUnit): string {
    return this.getEtdUnitEditPageRouterLinkWithID(etdunit.id);
  }

  /**
   * Get Edit page of etdunit
   * @param etdunitID EtdUnit ID we want edit page for
   */
  public getEtdUnitEditPageRouterLinkWithID(etdunitId: string): string {
    return '/etdunits/' + etdunitId;
  }

  public create(object: EtdUnit, ...params: RequestParam[]): Observable<RemoteData<EtdUnit>> {
    return this.createData.create(object, ...params);
  }

  searchBy(searchMethod: string, options?: FindListOptions, useCachedVersionIfAvailable?: boolean, reRequestOnStale?: boolean, ...linksToFollow: FollowLinkConfig<EtdUnit>[]): Observable<RemoteData<PaginatedList<EtdUnit>>> {
    return this.searchData.searchBy(searchMethod, options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }

  public createPatchFromCache(object: EtdUnit): Observable<Operation[]> {
    return this.patchData.createPatchFromCache(object);
  }

  patch(object: EtdUnit, operations: Operation[]): Observable<RemoteData<EtdUnit>> {
    return this.patchData.patch(object, operations);
  }

  update(object: EtdUnit): Observable<RemoteData<EtdUnit>> {
    return this.patchData.update(object);
  }

  commitUpdates(method?: RestRequestMethod): void {
    this.patchData.commitUpdates(method);
  }

  delete(objectId: string, copyVirtualMetadata?: string[]): Observable<RemoteData<NoContent>> {
    return this.deleteData.delete(objectId, copyVirtualMetadata);
  }

  public deleteByHref(href: string, copyVirtualMetadata?: string[]): Observable<RemoteData<NoContent>> {
    return this.deleteData.deleteByHref(href, copyVirtualMetadata);
  }
}
