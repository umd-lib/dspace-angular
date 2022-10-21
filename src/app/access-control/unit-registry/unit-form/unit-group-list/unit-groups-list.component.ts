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
import { defaultIfEmpty, map, mergeMap, switchMap, take } from 'rxjs/operators';
import {buildPaginatedList, PaginatedList} from '../../../../core/data/paginated-list.model';
import { RemoteData } from '../../../../core/data/remote-data';
import { GroupDataService } from '../../../../core/eperson/group-data.service';
import { Group } from '../../../../core/eperson/models/group.model';
import {
  getFirstSucceededRemoteData,
  getFirstCompletedRemoteData, getAllCompletedRemoteData, getRemoteDataPayload
} from '../../../../core/shared/operators';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { PaginationComponentOptions } from '../../../../shared/pagination/pagination-component-options.model';
import { PaginationService } from '../../../../core/pagination/pagination.service';
import { GroupDtoModel } from 'src/app/core/eperson/models/group-dto.model';
import { UnitDataService } from 'src/app/core/eperson/unit-data.service';
import { Unit } from 'src/app/core/eperson/models/unit.model';
import { UnitGroupDtoModel } from './unit-group-dto.model';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';

/**
 * Keys to keep track of specific subscriptions
 */
enum SubKey {
  ActiveUnit,
  GroupsDTO,
  SearchResultsDTO,
}

@Component({
  selector: 'ds-unit-groups-list',
  templateUrl: './unit-groups-list.component.html'
})
/**
 * The list of groups in the edit unit page
 */
export class UnitGroupsListComponent implements OnInit, OnDestroy {

  @Input()
  messagePrefix: string;

  /**
   * Groups being displayed in search result, initially all groups, after search result of search
   */
  groupSearchDtos: BehaviorSubject<PaginatedList<UnitGroupDtoModel>> = new BehaviorSubject<PaginatedList<UnitGroupDtoModel>>(undefined);
  /**
   * List of Groups of currently active unit being edited
   */
  groupsOfUnitDtos: BehaviorSubject<PaginatedList<UnitGroupDtoModel>> = new BehaviorSubject<PaginatedList<UnitGroupDtoModel>>(undefined);

  /**
   * Pagination config used to display the list of Groups that are result of Groups search
   */
  configSearch: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'gugl',
    pageSize: 5,
    currentPage: 1
  });
  /**
   * Pagination config used to display the list of Groups of active unit being edited
   */
  config: PaginationComponentOptions = Object.assign(new PaginationComponentOptions(), {
    id: 'ugl',
    pageSize: 5,
    currentPage: 1
  });

  /**
   * Map of active subscriptions
   */
  subs: Map<SubKey, Subscription> = new Map();

  // The search form
  searchForm;

  // Current search in edit group - epeople search form
  currentSearchQuery: string;
  currentSearchScope: string;

  // Whether or not user has done a EPeople search yet
  searchDone: boolean;

  // current active unit being edited
  unitBeingEdited: Unit;

  paginationSub: Subscription;


  constructor(private unitDataService: UnitDataService,
              public groupDataService: GroupDataService,
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
    this.subs.set(SubKey.ActiveUnit, this.unitDataService.getActiveUnit().subscribe((activeUnit: Unit) => {
      if (activeUnit != null) {
        this.unitBeingEdited = activeUnit;
        this.retrieveGroups(this.config.currentPage);
      }
    }));
  }

  /**
   * Retrieve the Groups that are part of the unit
   *
   * @param page the number of the page to retrieve
   * @private
   */
  private retrieveGroups(page: number) {
    this.unsubFrom(SubKey.GroupsDTO);
    this.subs.set(SubKey.GroupsDTO,
      this.paginationService.getCurrentPagination(this.config.id, this.config).pipe(
        switchMap((currentPagination) => {
          return this.groupDataService.findListByHref(this.unitBeingEdited._links.groups.href, {
              currentPage: currentPagination.currentPage,
              elementsPerPage: currentPagination.pageSize
            }, true, true, followLink('object')
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
      switchMap((groupListRD: RemoteData<PaginatedList<Group>>) => {
        const dtos$ = observableCombineLatest(...groupListRD.payload.page.map((group: Group) => {
          const dto$: Observable<UnitGroupDtoModel> = observableCombineLatest(
            this.isGroupOfUnit(group), (isInUnit: ObservedValueOf<Observable<boolean>>) => {
              const unitGroupDtoModel: UnitGroupDtoModel = new UnitGroupDtoModel();
              unitGroupDtoModel.group = group;
              unitGroupDtoModel.isInUnit = isInUnit;
              unitGroupDtoModel.object = group.object;
              return unitGroupDtoModel;
            });
          return dto$;
        }));
        return dtos$.pipe(defaultIfEmpty([]), map((dtos: UnitGroupDtoModel[]) => {
          return buildPaginatedList(groupListRD.payload.pageInfo, dtos);
        }));
      }))
      .subscribe((paginatedListOfDTOs: PaginatedList<UnitGroupDtoModel>) => {
        this.groupsOfUnitDtos.next(paginatedListOfDTOs);
      }));
  }

  /**
   * Whether or not the given Group is a group of the active unit
   * @param possibleGroup Group that is a possible member (being tested) of the unit currently being edited
   */
  isGroupOfUnit(possibleGroup: Group): Observable<boolean> {
    return this.unitDataService.getActiveUnit().pipe(take(1),
      mergeMap((unit: Unit) => {
        if (unit != null) {
          return this.groupDataService.findListByHref(unit._links.groups.href, {
            currentPage: 1,
            elementsPerPage: 9999
          })
            .pipe(
              getFirstSucceededRemoteData(),
              getRemoteDataPayload(),
              map((listGroupsInUnit: PaginatedList<Group>) => listGroupsInUnit.page.filter((groupInList: Group) => groupInList.id === possibleGroup.id)),
              map((groups: Group[]) => groups.length > 0));
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
   * Deletes a given Group from the Unit currently being edited
   * @param group Group we want to delete from unit that is currently being edited
   */
  deleteGroupFromUnit(group: GroupDtoModel) {
    this.unitDataService.getActiveUnit().pipe(take(1)).subscribe((activeUnit: Unit) => {
      if (activeUnit != null) {
        const response = this.unitDataService.deleteGroupFromUnit(activeUnit, group.group);
        this.showNotifications('deleteGroup', response, group.group.name, activeUnit);
      } else {
        this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.failure.noActiveUnit'));
      }
    });
  }

  /**
   * Adds a given Group to the unit currently being edited
   * @param group Group we want to add to unit that is currently being edited
   */
  addGroupToUnit(group: GroupDtoModel) {
    this.unitDataService.getActiveUnit().pipe(take(1)).subscribe((activeUnit: Unit) => {
      if (activeUnit != null) {
        const response = this.unitDataService.addGroupToUnit(activeUnit, group.group);
        this.showNotifications('addGroup', response, group.group.name, activeUnit);
      } else {
        this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.failure.noActiveUnit'));
      }
    });
  }

  /**
   * Search in the Groups by name or metadata
   * @param data  Contains scope and query param
   */
  search(data: any) {
    this.unsubFrom(SubKey.SearchResultsDTO);
    this.subs.set(SubKey.SearchResultsDTO,
      this.paginationService.getCurrentPagination(this.configSearch.id, this.configSearch).pipe(
        switchMap((paginationOptions) => {

          const query: string = data.query;
          const scope: string = data.scope;
          if (query != null && this.currentSearchQuery !== query && this.unitBeingEdited) {
            this.router.navigate([], {
              queryParamsHandling: 'merge'
            });
            this.currentSearchQuery = query;
            this.paginationService.resetPage(this.configSearch.id);
          }
          if (scope != null && this.currentSearchScope !== scope && this.unitBeingEdited) {
            this.router.navigate([], {
              queryParamsHandling: 'merge'
            });
            this.currentSearchScope = scope;
            this.paginationService.resetPage(this.configSearch.id);
          }
          this.searchDone = true;

          return this.groupDataService.searchGroups(this.currentSearchQuery, {
            currentPage: paginationOptions.currentPage,
            elementsPerPage: paginationOptions.pageSize,
          }, true, true, followLink('object'));
        }),
        getAllCompletedRemoteData(),
        map((rd: RemoteData<any>) => {
          if (rd.hasFailed) {
            this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.failure', {cause: rd.errorMessage}));
          } else {
            return rd;
          }
        }),
        switchMap((groupListRD: RemoteData<PaginatedList<Group>>) => {
          const dtos$ = observableCombineLatest(...groupListRD.payload.page.map((group: Group) => {
            const dto$: Observable<UnitGroupDtoModel> = observableCombineLatest(
              this.isGroupOfUnit(group), (isInUnit: ObservedValueOf<Observable<boolean>>) => {
                const unitGroupDtoModel: UnitGroupDtoModel = new UnitGroupDtoModel();
                unitGroupDtoModel.group = group;
                unitGroupDtoModel.isInUnit = isInUnit;
                unitGroupDtoModel.object = group.object;
                return unitGroupDtoModel;
              });
            return dto$;
          }));
          return dtos$.pipe(map((dtos: GroupDtoModel[]) => {
            return buildPaginatedList(groupListRD.payload.pageInfo, dtos);
          }));
        }))
        .subscribe((paginatedListOfDTOs: PaginatedList<UnitGroupDtoModel>) => {
          this.groupSearchDtos.next(paginatedListOfDTOs);
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
  showNotifications(messageSuffix: string, response: Observable<RemoteData<any>>, nameObject: string, activeUnit: Unit) {
    response.pipe(getFirstCompletedRemoteData()).subscribe((rd: RemoteData<any>) => {
      if (rd.hasSucceeded) {
        this.notificationsService.success(this.translateService.get(this.messagePrefix + '.notification.success.' + messageSuffix, { name: nameObject }));
        this.unitDataService.clearGroupLinkRequests(activeUnit._links.groups.href);
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
}
