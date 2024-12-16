import {
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  createSelector,
  select,
  Store,
} from '@ngrx/store';
import { Operation } from 'fast-json-patch';
import {
  Observable,
  zip as observableZip,
} from 'rxjs';
import { take } from 'rxjs/operators';
import {
  UnitRegistryCancelUnitAction,
  UnitRegistryEditUnitAction,
} from 'src/app/access-control/unit-registry/unit-registry.actions';
import { UnitRegistryState } from 'src/app/access-control/unit-registry/unit-registry.reducers';

import { AppState } from '../../app.reducer';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { DSONameService } from '../breadcrumbs/dso-name.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { RequestParam } from '../cache/models/request-param.model';
import { ObjectCacheService } from '../cache/object-cache.service';
import {
  CreateData,
  CreateDataImpl,
} from '../data/base/create-data';
import {
  DeleteData,
  DeleteDataImpl,
} from '../data/base/delete-data';
import { IdentifiableDataService } from '../data/base/identifiable-data.service';
import {
  PatchData,
  PatchDataImpl,
} from '../data/base/patch-data';
import {
  SearchData,
  SearchDataImpl,
} from '../data/base/search-data';
import { DSOChangeAnalyzer } from '../data/dso-change-analyzer.service';
import { FindListOptions } from '../data/find-list-options.model';
import { PaginatedList } from '../data/paginated-list.model';
import { RemoteData } from '../data/remote-data';
import {
  DeleteRequest,
  PostRequest,
} from '../data/request.models';
import { RequestService } from '../data/request.service';
import { RestRequestMethod } from '../data/rest-request-method';
import { HttpOptions } from '../dspace-rest/dspace-rest.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { NoContent } from '../shared/NoContent.model';
import { Group } from './models/group.model';
import { Unit } from './models/unit.model';

const unitRegistryStateSelector = (state: AppState) => state.unitRegistry;
const editUnitSelector = createSelector(unitRegistryStateSelector, (unitRegistryState: UnitRegistryState) => unitRegistryState.editUnit);

/**
 * Provides methods to retrieve eperson unit resources from the REST API and
 * Unit related CRUD actions.
 */
@Injectable({ providedIn: 'root' })
export class UnitDataService extends IdentifiableDataService<Unit> {
  protected browseEndpoint = '';
  public ePersonsEndpoint = 'epersons';
  public groupsEndpoint = 'groups';

  private createData: CreateData<Unit>;
  private searchData: SearchData<Unit>;
  private patchData: PatchData<Unit>;
  private deleteData: DeleteData<Unit>;

  constructor(
    protected comparator: DSOChangeAnalyzer<Unit>,
    protected http: HttpClient,
    protected notificationsService: NotificationsService,
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<any>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected nameService: DSONameService,
  ) {
    super('units', requestService, rdbService, objectCache, halService);

    this.createData = new CreateDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, notificationsService, this.responseMsToLive);
    this.searchData = new SearchDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, this.responseMsToLive);
    this.patchData = new PatchDataImpl<Unit>(this.linkPath, requestService, rdbService, objectCache, halService, comparator, this.responseMsToLive, this.constructIdEndpoint);
    this.deleteData = new DeleteDataImpl(this.linkPath, requestService, rdbService, objectCache, halService, notificationsService, this.responseMsToLive, this.constructIdEndpoint);
  }

  /**
   * Returns a search result list of units, with certain query (searches in group name and by exact uuid)
   * Endpoint used: /eperson/units/search/byMetadata?query=<:name>
   * @param query                       search query param
   * @param options
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  public searchUnits(query: string, options?: FindListOptions, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Unit>[]): Observable<RemoteData<PaginatedList<Unit>>> {
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
   * Adds given group to given unit
   * @param activeUnit Unit we want to add member to
   * @param group group we want to add to given activeUnit
   */
  addGroupToUnit(activeUnit: Unit, group: Group): Observable<RemoteData<Unit>> {
    const requestId = this.requestService.generateRequestId();
    const options: HttpOptions = Object.create({});
    let headers = new HttpHeaders();
    headers = headers.append('Content-Type', 'text/uri-list');
    options.headers = headers;
    const postRequest = new PostRequest(requestId, activeUnit.self + '/' + this.groupsEndpoint, group.self, options);
    this.requestService.send(postRequest);

    return this.rdbService.buildFromRequestUUIDAndAwait(requestId, () => observableZip(
      this.invalidateByHref(activeUnit._links.self.href),
      this.requestService.setStaleByHrefSubstring(activeUnit._links.groups.href).pipe(take(1)),
    ));
  }

  /**
   * Deletes a given Group from given active unit
   * @param activeUnit Unit we want to delete member from
   * @param group Group we want to delete from members of given activeGroup
   */
  deleteGroupFromUnit(activeUnit: Unit, group: Group): Observable<RemoteData<NoContent>> {
    const requestId = this.requestService.generateRequestId();
    const deleteRequest = new DeleteRequest(requestId, activeUnit.self + '/' + this.groupsEndpoint + '/' + group.id);
    this.requestService.send(deleteRequest);

    return this.rdbService.buildFromRequestUUIDAndAwait(requestId, () => observableZip(
      this.invalidateByHref(activeUnit._links.self.href),
      this.requestService.setStaleByHrefSubstring(activeUnit._links.groups.href).pipe(take(1)),
    ));
  }

  /**
   * Method to retrieve the unit that is currently being edited
   */
  public getActiveUnit(): Observable<Unit> {
    return this.store.pipe(select(editUnitSelector));
  }

  /**
   * Method to cancel editing a unit, dispatches a cancel unit action
   */
  public cancelEditUnit() {
    this.store.dispatch(new UnitRegistryCancelUnitAction());
  }

  /**
   * Method to set the unit being edited, dispatches an edit unit action
   * @param unit The Unit to edit
   */
  public editUnit(unit: Unit) {
    this.store.dispatch(new UnitRegistryEditUnitAction(unit));
  }

  /**
   * Method that clears a cached units request
   */
  public clearUnitsRequests(): void {
    this.getBrowseEndpoint().pipe(take(1)).subscribe((link: string) => {
      this.requestService.removeByHrefSubstring(link);
    });
  }

  /**
   * Method that clears a cached groups request
   */
  public clearGroupLinkRequests(href: string): void {
    this.requestService.setStaleByHrefSubstring(href);
  }

  public getUnitRegistryRouterLink(): string {
    return '/access-control/units';
  }

  /**
   * Get Edit page of unit
   * @param unit Unit we want edit page for
   */
  public getUnitEditPageRouterLink(unit: Unit): string {
    return this.getUnitEditPageRouterLinkWithID(unit.id);
  }

  /**
   * Get Edit page of unit
   * @param unitID Unit ID we want edit page for
   */
  public getUnitEditPageRouterLinkWithID(unitId: string): string {
    return '/access-control/units/' + unitId;
  }

  public create(object: Unit, ...params: RequestParam[]): Observable<RemoteData<Unit>> {
    return this.createData.create(object, ...params);
  }

  searchBy(searchMethod: string, options?: FindListOptions, useCachedVersionIfAvailable?: boolean, reRequestOnStale?: boolean, ...linksToFollow: FollowLinkConfig<Unit>[]): Observable<RemoteData<PaginatedList<Unit>>> {
    return this.searchData.searchBy(searchMethod, options, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }

  public createPatchFromCache(object: Unit): Observable<Operation[]> {
    return this.patchData.createPatchFromCache(object);
  }

  patch(object: Unit, operations: Operation[]): Observable<RemoteData<Unit>> {
    return this.patchData.patch(object, operations);
  }

  update(object: Unit): Observable<RemoteData<Unit>> {
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
