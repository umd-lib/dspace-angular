import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  of as observableOf,
  Subscription,
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  ObservedValueOf,
} from 'rxjs';
import { defaultIfEmpty, map, mergeMap, startWith, switchMap, take } from 'rxjs/operators';
import {buildPaginatedList, PaginatedList} from '../../../core/data/paginated-list.model';
import { RemoteData } from '../../../core/data/remote-data';
import {
  getFirstSucceededRemoteData,
  getFirstCompletedRemoteData, getAllCompletedRemoteData, getRemoteDataPayload, toDSpaceObjectListRD
} from '../../../core/shared/operators';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { PaginationComponentOptions } from '../../../shared/pagination/pagination-component-options.model';
import { PaginationService } from '../../../core/pagination/pagination.service';
import { followLink, FollowLinkConfig } from 'src/app/shared/utils/follow-link-config.model';
import { EtdUnitCollectionDtoModel } from './etdunit-collection-dto.model';
import { EtdUnit } from '../../models/etdunit.model';
import { EtdUnitDataService } from '../../etdunit-data.service';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { Collection } from 'src/app/core/shared/collection.model';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { PaginatedSearchOptions } from 'src/app/shared/search/models/paginated-search-options.model';
import { SearchConfigurationService } from 'src/app/core/shared/search/search-configuration.service';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { URLCombiner } from 'src/app/core/url-combiner/url-combiner';
import { HALEndpointService } from 'src/app/core/shared/hal-endpoint.service';
import { FindListOptions } from 'src/app/core/data/find-list-options.model';
import { RequestParam } from 'src/app/core/cache/models/request-param.model';

/**
 * Keys to keep track of specific subscriptions
 */
enum SubKey {
  ActiveEtdUnit,
  CollectionsDTO,
  SearchResultsDTO,
}

@Component({
  selector: 'ds-etdunit-collections-list',
  templateUrl: './etdunit-collections-list.component.html'
})
/**
 * The list of collections in the edit ETD unit page
 */
export class EtdUnitCollectionsListComponent implements OnInit, OnDestroy {

  @Input()
  messagePrefix: string;

  /**
   * Collections being displayed in search result, initially all collections, after search result of search
   */
  collectionSearchDtos: BehaviorSubject<PaginatedList<EtdUnitCollectionDtoModel>> = new BehaviorSubject<PaginatedList<EtdUnitCollectionDtoModel>>(undefined);
  /**
   * List of Collections of currently active ETD unit being edited
   */
  collectionsOfEtdUnitDtos: BehaviorSubject<PaginatedList<EtdUnitCollectionDtoModel>> = new BehaviorSubject<PaginatedList<EtdUnitCollectionDtoModel>>(undefined);

  /**
   * Pagination config used to display the list of Collections that are result of Collections search
   */
  configSearch: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'etdUnitsSearchResult',
    pageSize: 5,
    currentPage: 1
  });
  /**
   * Pagination config used to display the list of Collections of active ETD unit being edited
   */
  config: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'etdUnitCollectionsList',
    pageSize: 5,
    currentPage: 1
  });

  /**
   * Map of active subscriptions
   */
  subs: Map<SubKey, Subscription> = new Map();

  // The search form
  searchForm;

  // Current search in edit ETD Unit - collection search form
  currentSearchQuery: string;
  currentSearchScope: string;

  // Whether or not user has done a Collection search yet
  searchDone: boolean;

  // current active ETD unit being edited
  etdUnitBeingEdited: EtdUnit;

  paginationSub: Subscription;


  constructor(private etdUnitDataService: EtdUnitDataService,
              public collectionDataService: CollectionDataService,
              private translateService: TranslateService,
              private notificationsService: NotificationsService,
              private formBuilder: FormBuilder,
              private paginationService: PaginationService,
              private router: Router) {
    this.currentSearchQuery = '';
    this.currentSearchScope = 'metadata';
  }

  ngOnInit() {
    this.searchForm = this.formBuilder.group(({
      scope: 'metadata',
      query: '',
    }));
    this.subs.set(SubKey.ActiveEtdUnit, this.etdUnitDataService.getActiveEtdUnit().subscribe((activeEtdUnit: EtdUnit) => {
      if (activeEtdUnit != null) {
        this.etdUnitBeingEdited = activeEtdUnit;
        this.retrieveCollections(this.config.currentPage);
      }
    }));
  }

  /**
   * Retrieve the Collections that are part of the ETD unit
   *
   * @param page the number of the page to retrieve
   * @private
   */
  private retrieveCollections(page: number) {
    this.unsubFrom(SubKey.CollectionsDTO);
    this.subs.set(SubKey.CollectionsDTO,
      this.paginationService.getCurrentPagination(this.config.id, this.config).pipe(
        switchMap((currentPagination) => {
          return this.collectionDataService.findListByHref(this.etdUnitBeingEdited._links.collections.href, {
              currentPage: currentPagination.currentPage,
              elementsPerPage: currentPagination.pageSize
            }, true, true
          );
        }),
      getAllCompletedRemoteData(),
      map((rd: RemoteData<any>) => {
        if (rd.hasFailed) {
          this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.failure', {cause: rd.errorMessage}));
        } else {
          return rd;
        }
      }),
      switchMap((collectionListRD: RemoteData<PaginatedList<Collection>>) => {
        const dtos$ = observableCombineLatest(...collectionListRD.payload.page.map((collection: Collection) => {
          const dto$: Observable<EtdUnitCollectionDtoModel> = observableCombineLatest(
            this.isCollectionOfEtdUnit(collection), (isInEtdUnit: ObservedValueOf<Observable<boolean>>) => {
              const etdUnitCollectionDtoModel: EtdUnitCollectionDtoModel = new EtdUnitCollectionDtoModel();
              etdUnitCollectionDtoModel.collection = collection;
              etdUnitCollectionDtoModel.isInEtdUnit = isInEtdUnit;
              return etdUnitCollectionDtoModel;
            });
          return dto$;
        }));
        return dtos$.pipe(defaultIfEmpty([]), map((dtos: EtdUnitCollectionDtoModel[]) => {
          return buildPaginatedList(collectionListRD.payload.pageInfo, dtos);
        }));
      }))
      .subscribe((paginatedListOfDTOs: PaginatedList<EtdUnitCollectionDtoModel>) => {
        this.collectionsOfEtdUnitDtos.next(paginatedListOfDTOs);
      }));
  }

  /**
   * Whether or not the given Collection is a collection of the active ETD unit
   * @param possibleCollection Collection that is a possible member (being tested) of the active ETD unit
   */
  isCollectionOfEtdUnit(possibleCollection: Collection): Observable<boolean> {
    return this.etdUnitDataService.getActiveEtdUnit().pipe(take(1),
      mergeMap((etdUnit: EtdUnit) => {
        if (etdUnit != null) {
          return this.collectionDataService.findListByHref(etdUnit._links.collections.href, {
            currentPage: 1,
            elementsPerPage: 9999
          })
            .pipe(
              getFirstSucceededRemoteData(),
              getRemoteDataPayload(),
              map((listCollectionsInEtdUnit: PaginatedList<Collection>) => listCollectionsInEtdUnit.page.filter((collectionInList: Collection) => collectionInList.id === possibleCollection.id)),
              map((collections: Collection[]) => collections.length > 0));
        } else {
          return observableOf(false);
        }
      }));
  }

  /**
   * Unsubscribe from a subscription if it's still subscribed, and remove it from the map of
   * active subscriptions
   *
   * @param key The key of the subscription to unsubscribe from
   * @private
   */
  private unsubFrom(key: SubKey) {
    if (this.subs.has(key)) {
      this.subs.get(key).unsubscribe();
      this.subs.delete(key);
    }
  }

  /**
   * Deletes a given Collection from the ETD Unit currently being edited
   * @param collectionDto Collection to delete from ETD unit that is currently being edited
   */
  deleteCollectionFromEtdUnit(collectionDto: EtdUnitCollectionDtoModel) {
    this.etdUnitDataService.getActiveEtdUnit().pipe(take(1)).subscribe((activeEtdUnit: EtdUnit) => {
      if (activeEtdUnit != null) {
        const response = this.etdUnitDataService.deleteCollectionFromEtdUnit(activeEtdUnit, collectionDto.collection);
        this.showNotifications('deleteCollection', response, collectionDto.collection.name, activeEtdUnit);
      } else {
        this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.failure.noActiveEtdUnit'));
      }
    });
  }

  /**
   * Adds a given Collection to the ETD unit currently being edited
   * @param collectionDto Collection to add to ETD unit that is currently being edited
   */
  addCollectionToEtdUnit(collectionDto: EtdUnitCollectionDtoModel) {
    this.etdUnitDataService.getActiveEtdUnit().pipe(take(1)).subscribe((activeEtdUnit: EtdUnit) => {
      if (activeEtdUnit != null) {
        const response = this.etdUnitDataService.addCollectionToEtdUnit(activeEtdUnit, collectionDto.collection);
        this.showNotifications('addCollection', response, collectionDto.collection.name, activeEtdUnit);
      } else {
        this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.failure.noActiveUnit'));
      }
    });
  }

  /**
   * Search in the Collections by name or metadata
   * @param data  Contains scope and query param
   */
  search(data: any) {
    this.unsubFrom(SubKey.SearchResultsDTO);
    this.subs.set(SubKey.SearchResultsDTO,
      this.paginationService.getCurrentPagination(this.configSearch.id, this.configSearch).pipe(
        switchMap((paginationOptions) => {

          const query: string = data.query;
          const scope: string = data.scope;
          if (query != null && this.currentSearchQuery !== query && this.etdUnitBeingEdited) {
            this.router.navigate([], {
              queryParamsHandling: 'merge'
            });
            this.currentSearchQuery = query;
            this.paginationService.resetPage(this.configSearch.id);
          }
          if (scope != null && this.currentSearchScope !== scope && this.etdUnitBeingEdited) {
            this.router.navigate([], {
              queryParamsHandling: 'merge'
            });
            this.currentSearchScope = scope;
            this.paginationService.resetPage(this.configSearch.id);
          }
          this.searchDone = true;

          return this.searchCollections(this.currentSearchQuery, {
            currentPage: paginationOptions.currentPage,
            elementsPerPage: paginationOptions.pageSize,
           }, true, true/*, followLink('object')*/);
        }),
        getAllCompletedRemoteData(),
        map((rd: RemoteData<any>) => {
          if (rd.hasFailed) {
            this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.failure', {cause: rd.errorMessage}));
          } else {
            return rd;
          }
        }),
        switchMap((collectionListRD: RemoteData<PaginatedList<Collection>>) => {
          const dtos$ = observableCombineLatest(...collectionListRD.payload.page.map((collection: Collection) => {
            const dto$: Observable<EtdUnitCollectionDtoModel> = observableCombineLatest(
              this.isCollectionOfEtdUnit(collection), (isInEtdUnit: ObservedValueOf<Observable<boolean>>) => {
                const etdUnitCollectionDtoModel: EtdUnitCollectionDtoModel = new EtdUnitCollectionDtoModel();
                etdUnitCollectionDtoModel.collection = collection;
                etdUnitCollectionDtoModel.isInEtdUnit = isInEtdUnit;
                return etdUnitCollectionDtoModel;
              });
            return dto$;
          }));
          return dtos$.pipe(map((dtos: EtdUnitCollectionDtoModel[]) => {
            return buildPaginatedList(collectionListRD.payload.pageInfo, dtos);
          }));
        }))
        .subscribe((paginatedListOfDTOs: PaginatedList<EtdUnitCollectionDtoModel>) => {
          this.collectionSearchDtos.next(paginatedListOfDTOs);
        }));
  }

  /**
   * unsub all subscriptions
   */
  ngOnDestroy(): void {
    for (const key of this.subs.keys()) {
      this.unsubFrom(key);
    }
    this.paginationService.clearPagination(this.config.id);
    this.paginationService.clearPagination(this.configSearch.id);
  }

  /**
   * Shows a notification based on the success/failure of the request
   * @param messageSuffix   Suffix for message
   * @param response        RestResponse observable containing success/failure request
   * @param nameObject      Object request was about
   * @param activeGroup     Group currently being edited
   */
  showNotifications(messageSuffix: string, response: Observable<RemoteData<any>>, nameObject: string, activeEtdUnit: EtdUnit) {
    response.pipe(getFirstCompletedRemoteData()).subscribe((rd: RemoteData<any>) => {
      if (rd.hasSucceeded) {
        this.notificationsService.success(this.translateService.get(this.messagePrefix + '.notification.success.' + messageSuffix, { name: nameObject }));
        this.etdUnitDataService.clearCollectionLinkRequests(activeEtdUnit._links.collections.href);
      } else {
        this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.failure.' + messageSuffix, { name: nameObject }));
      }
    });
  }

  /**
   * Reset all input-fields to be empty and search all search
   */
  clearFormAndResetResult() {
    this.searchForm.patchValue({
      query: '',
    });
    this.search({ query: '' });
  }

  searchCollections(query: string, options?: FindListOptions, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Collection>[]): Observable<RemoteData<PaginatedList<Collection>>> {
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
    // org.dspace.app.rest.repository.CollectionRestRepository on the back-end
    // does not have a "byMetadata" SearchRestMethod annotiation, so using
    // the "findAdminAuthorized" SearchRestMethod to get all the collections.
    return this.collectionDataService.searchBy('findAdminAuthorized', findListOptions, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }
}
