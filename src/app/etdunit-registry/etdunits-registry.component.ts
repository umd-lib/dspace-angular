import { Component, OnDestroy, OnInit } from '@angular/core';
import { hasValue } from 'src/app/shared/empty.util';
import {
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  Observable,
  of as observableOf,
  Subscription
} from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { buildPaginatedList, PaginatedList } from 'src/app/core/data/paginated-list.model';
import { PageInfo } from 'src/app/core/shared/page-info.model';
import { EtdUnit } from './models/etdunit.model';
import { PaginationComponentOptions } from 'src/app/shared/pagination/pagination-component-options.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaginationService } from 'src/app/core/pagination/pagination.service';
import { EtdUnitDataService } from './etdunit-data.service';
import { EtdUnitDtoModel } from './models/etdunit-dto.model';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { getAllSucceededRemoteData, getFirstCompletedRemoteData, getFirstSucceededRemoteData, getRemoteDataPayload } from 'src/app/core/shared/operators';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RemoteData } from 'src/app/core/data/remote-data';
import { NoContent } from 'src/app/core/shared/NoContent.model';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { Collection } from 'src/app/core/shared/collection.model';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';

@Component({
  selector: 'ds-etdunits-registry',
  templateUrl: './etdunits-registry.component.html',
  styleUrls: ['./etdunits-registry.component.scss']
})
export class EtdUnitsRegistryComponent implements OnInit, OnDestroy {

  messagePrefix = 'admin.core.etdunits.';

  /**
   * Pagination config used to display the list of etdunits
   */
  config: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'ul',
    pageSize: 5,
    currentPage: 1
  });

  /**
   * A BehaviorSubject with the list of EtdUnitDtoModel objects made from the EtdUnits
   * in the repository or as the result of the search
   */
  etdunitsDto$: BehaviorSubject<PaginatedList<EtdUnitDtoModel>> = new BehaviorSubject<PaginatedList<EtdUnitDtoModel>>({} as any);
  deletedEtdUnitsIds: string[] = [];

  // Current search in etdunits registry
  currentSearchQuery: string;

  /**
   * The subscription for the search method
   */
  searchSub: Subscription;

  /**
   * List of subscriptions
   */
  subs: Subscription[] = [];

  /**
   * An observable for the pageInfo, needed to pass to the pagination component
   */
  pageInfoState$: BehaviorSubject<PageInfo> = new BehaviorSubject<PageInfo>(undefined);

  // The search form
  searchForm: FormGroup;

  /**
   * A boolean representing if a search is pending
   */
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(public etdunitService: EtdUnitDataService,
    private collectionService: CollectionDataService,
    private translateService: TranslateService,
    private notificationsService: NotificationsService,
    private formBuilder: FormBuilder,
    private authorizationService: AuthorizationDataService,
    private paginationService: PaginationService,) {
    this.currentSearchQuery = '';
    this.searchForm = this.formBuilder.group(({
      query: this.currentSearchQuery,
    }));
  }

  ngOnInit(): void {
    this.search({ query: this.currentSearchQuery });
  }


  /**
   * Search in the etdunits (searches by etdunit name and by uuid exact match)
   * @param data  Contains query param
   */
  search(data: any) {
    if (hasValue(this.searchSub)) {
      this.searchSub.unsubscribe();
      this.subs = this.subs.filter((sub: Subscription) => sub !== this.searchSub);
    }

    this.searchSub = this.paginationService.getCurrentPagination(this.config.id, this.config).pipe(
      tap(() => this.loading$.next(true)),
      switchMap((paginationOptions) => {
        const query: string = data.query;
        if (query != null && this.currentSearchQuery !== query) {
          this.currentSearchQuery = query;
          this.paginationService.updateRouteWithUrl(this.config.id, [], { page: 1 });
        }
        return this.etdunitService.searchEtdUnits(this.currentSearchQuery.trim(), {
          currentPage: paginationOptions.currentPage,
          elementsPerPage: paginationOptions.pageSize,
        }, true, true, followLink('collections'));
      }),
      getAllSucceededRemoteData(),
      getRemoteDataPayload(),
      switchMap((etdunits: PaginatedList<EtdUnit>) => {
        if (etdunits.page.length === 0) {
          return observableOf(buildPaginatedList(etdunits.pageInfo, []));
        }
        return this.authorizationService.isAuthorized(FeatureID.AdministratorOf).pipe(
          switchMap((isSiteAdmin: boolean) => {
            return observableCombineLatest(etdunits.page.map((etdunit: EtdUnit) => {
              if (hasValue(etdunit) && !this.deletedEtdUnitsIds.includes(etdunit.id)) {
                return observableCombineLatest([
                  this.authorizationService.isAuthorized(FeatureID.CanDelete, etdunit.self),
                  this.canManageEtdUnit$(isSiteAdmin),
                  this.getCollections(etdunit),
                ]).pipe(
                  map(([canDelete, canManageEtdUnit, collections]:
                    [boolean, boolean, RemoteData<PaginatedList<Collection>>]) => {
                    const etdunitDtoModel: EtdUnitDtoModel = new EtdUnitDtoModel();
                    etdunitDtoModel.ableToDelete = canDelete;
                    etdunitDtoModel.ableToEdit = canManageEtdUnit;
                    etdunitDtoModel.etdunit = etdunit;
                    etdunitDtoModel.collections = collections.payload;
                    return etdunitDtoModel;
                  }
                  )
                );
              }
            })).pipe(map((dtos: EtdUnitDtoModel[]) => {
              return buildPaginatedList(etdunits.pageInfo, dtos);
            }));
          })
        );
      })
    ).subscribe((value: PaginatedList<EtdUnitDtoModel>) => {
      this.etdunitsDto$.next(value);
      this.pageInfoState$.next(value.pageInfo);
      this.loading$.next(false);
    });

    this.subs.push(this.searchSub);
  }

  /**
   * Returns an Observable that is true if the etdunit can be edited by the
   * current user, false otherwise.
   *
   * @param isSiteAdmin true if the user is an administrator, false otherwise
   * @return an Observable that is true if the etdunit can be edited by the
   * current user, falsue otherwise.
   */
  canManageEtdUnit$(isSiteAdmin: boolean): Observable<boolean> {
    // Only admins can manage etdunits (and can manage all EtdUnits)
    return observableOf(isSiteAdmin);
  }

  /**
   * Delete EtdUnit
   */
  deleteEtdUnit(etdunit: EtdUnitDtoModel) {
    if (hasValue(etdunit.etdunit.id)) {
      this.etdunitService.delete(etdunit.etdunit.id).pipe(getFirstCompletedRemoteData())
        .subscribe((rd: RemoteData<NoContent>) => {
          if (rd.hasSucceeded) {
            this.deletedEtdUnitsIds = [...this.deletedEtdUnitsIds, etdunit.etdunit.id];
            this.notificationsService.success(this.translateService.get(this.messagePrefix + 'notification.deleted.success', { name: etdunit.etdunit.name }));
          } else {
            this.notificationsService.error(
              this.translateService.get(this.messagePrefix + 'notification.deleted.failure.title', { name: etdunit.etdunit.name }),
              this.translateService.get(this.messagePrefix + 'notification.deleted.failure.content', { cause: rd.errorMessage }));
          }
        });
    }
  }

  /**
   * Get the collections belonging to this EtdUnit
   * @param etdunit the EtdUnit to return the collections go.
   */
  getCollections(etdunit: EtdUnit): Observable<RemoteData<PaginatedList<Collection>>> {
    return this.collectionService.findListByHref(etdunit._links.collections.href).pipe(getFirstSucceededRemoteData());
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

  /**
   * Unsub all subscriptions
   */
  ngOnDestroy(): void {
    this.cleanupSubscribes();
    this.paginationService.clearPagination(this.config.id);
  }


  cleanupSubscribes() {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
    this.paginationService.clearPagination(this.config.id);
  }
}
