import { Component, OnDestroy, OnInit } from '@angular/core';
import { hasValue } from 'src/app/shared/empty.util';
import {
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  Observable,
  of as observableOf,
  Subscription
} from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { buildPaginatedList, PaginatedList } from 'src/app/core/data/paginated-list.model';
import { PageInfo } from 'src/app/core/shared/page-info.model';
import { Unit } from 'src/app/core/eperson/models/unit.model';
import { PaginationComponentOptions } from 'src/app/shared/pagination/pagination-component-options.model';
import { TranslateService } from '@ngx-translate/core';
import { PaginationService } from 'src/app/core/pagination/pagination.service';
import { UnitDataService } from 'src/app/core/eperson/unit-data.service';
import { UnitDtoModel } from 'src/app/core/eperson/models/unit-dto.model';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { getAllSucceededRemoteData, getFirstCompletedRemoteData, getFirstSucceededRemoteData, getRemoteDataPayload } from 'src/app/core/shared/operators';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RemoteData } from 'src/app/core/data/remote-data';
import { NoContent } from 'src/app/core/shared/NoContent.model';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { Group } from 'src/app/core/eperson/models/group.model';
import { GroupDataService } from 'src/app/core/eperson/group-data.service';

@Component({
  selector: 'ds-units-registry',
  templateUrl: './units-registry.component.html',
  styleUrls: ['./units-registry.component.scss']
})
export class UnitsRegistryComponent implements OnInit, OnDestroy {

  messagePrefix = 'admin.access-control.units.';

  /**
   * Pagination config used to display the list of groups
   */
  config: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'ul',
    pageSize: 5,
    currentPage: 1
  });

  /**
   * A BehaviorSubject with the list of UnitDtoModel objects made from the Units in the repository or
   * as the result of the search
   */
  unitsDto$: BehaviorSubject<PaginatedList<UnitDtoModel>> = new BehaviorSubject<PaginatedList<UnitDtoModel>>({} as any);
  deletedUnitsIds: string[] = [];

  // Current search in units registry
  currentSearchQuery: string;

  /**
   * The subscription for the search method
   */
  searchSub: Subscription;

  // paginationSub: Subscription;

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

  constructor(public unitService: UnitDataService,
              private groupService: GroupDataService,
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
   * Search in the units (searches by unit name and by uuid exact match)
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
          this.paginationService.updateRouteWithUrl(this.config.id, [], {page: 1});
        }
        return this.unitService.searchUnits(this.currentSearchQuery.trim(), {
          currentPage: paginationOptions.currentPage,
          elementsPerPage: paginationOptions.pageSize,
        }, true, true, followLink('groups'));
      }),
      getAllSucceededRemoteData(),
      getRemoteDataPayload(),
      switchMap((units: PaginatedList<Unit>) => {
        if (units.page.length === 0) {
          return observableOf(buildPaginatedList(units.pageInfo, []));
        }
        return this.authorizationService.isAuthorized(FeatureID.AdministratorOf).pipe(
          switchMap((isSiteAdmin: boolean) => {
            return observableCombineLatest(units.page.map((unit: Unit) => {
              if (hasValue(unit) && !this.deletedUnitsIds.includes(unit.id)) {
                return observableCombineLatest([
                  this.authorizationService.isAuthorized(FeatureID.CanDelete, unit.self),
                  this.canManageUnit$(isSiteAdmin),
                  this.getGroups(unit),
                ]).pipe(
                  map(([canDelete, canManageUnit, groups]:
                         [boolean, boolean, RemoteData<PaginatedList<Group>>]) => {
                      const unitDtoModel: UnitDtoModel = new UnitDtoModel();
                      unitDtoModel.ableToDelete = canDelete;
                      unitDtoModel.ableToEdit = canManageUnit;
                      unitDtoModel.unit = unit;
                      unitDtoModel.groups = groups.payload;
                      return unitDtoModel;
                    }
                  )
                );
              }
            })).pipe(map((dtos: UnitDtoModel[]) => {
              return buildPaginatedList(units.pageInfo, dtos);
            }));
          })
        );
      })
    ).subscribe((value: PaginatedList<UnitDtoModel>) => {
      this.unitsDto$.next(value);
      this.pageInfoState$.next(value.pageInfo);
      this.loading$.next(false);
    });

    this.subs.push(this.searchSub);
  }

  /**
   * Returns an Observable that is true if the unit can be edited by the
   * current user, false otherwise.
   *
   * @param isSiteAdmin true if the user is an administrator, false otherwise
   * @return an Observable that is true if the unit can be edited by the
   * current user, falsue otherwise.
   */
  canManageUnit$(isSiteAdmin: boolean): Observable<boolean> {
    // Only admins can manage units (and can manage all Units)
    return observableOf(isSiteAdmin);
  }

  /**
   * Delete Unit
   */
   deleteUnit(unit: UnitDtoModel) {
    if (hasValue(unit.unit.id)) {
      this.unitService.delete(unit.unit.id).pipe(getFirstCompletedRemoteData())
        .subscribe((rd: RemoteData<NoContent>) => {
          if (rd.hasSucceeded) {
            this.deletedUnitsIds = [...this.deletedUnitsIds, unit.unit.id];
            this.notificationsService.success(this.translateService.get(this.messagePrefix + 'notification.deleted.success', { name: unit.unit.name }));
          } else {
            this.notificationsService.error(
              this.translateService.get(this.messagePrefix + 'notification.deleted.failure.title', { name: unit.unit.name }),
              this.translateService.get(this.messagePrefix + 'notification.deleted.failure.content', { cause: rd.errorMessage }));
          }
      });
    }
  }

  /**
   * Get the groups belonging to this Unit
   * @param unit the Unit to return the groups go.
   */
   getGroups(unit: Unit): Observable<RemoteData<PaginatedList<Group>>> {
    return this.groupService.findListByHref(unit._links.groups.href).pipe(getFirstSucceededRemoteData());
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
    // if (hasValue(this.paginationSub)) {
    //   this.paginationSub.unsubscribe();
    // }
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
    this.paginationService.clearPagination(this.config.id);
  }
}
