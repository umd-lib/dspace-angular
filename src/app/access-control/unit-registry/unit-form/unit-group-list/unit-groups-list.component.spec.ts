import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of as observableOf } from 'rxjs';
import { RestResponse } from '../../../../core/cache/response.models';
import { buildPaginatedList, PaginatedList } from '../../../../core/data/paginated-list.model';
import { RemoteData } from '../../../../core/data/remote-data';
import { GroupDataService } from '../../../../core/eperson/group-data.service';
import { Group } from '../../../../core/eperson/models/group.model';
import { PageInfo } from '../../../../core/shared/page-info.model';
import { FormBuilderService } from '../../../../shared/form/builder/form-builder.service';
import { NotificationsService } from '../../../../shared/notifications/notifications.service';
import { GroupMock, GroupMock2 } from '../../../../shared/testing/group-mock';
import { createSuccessfulRemoteDataObject$ } from '../../../../shared/remote-data.utils';
import { getMockTranslateService } from '../../../../shared/mocks/translate.service.mock';
import { getMockFormBuilderService } from '../../../../shared/mocks/form-builder-service.mock';
import { TranslateLoaderMock } from '../../../../shared/testing/translate-loader.mock';
import { NotificationsServiceStub } from '../../../../shared/testing/notifications-service.stub';
import { RouterMock } from '../../../../shared/mocks/router.mock';
import { PaginationService } from '../../../../core/pagination/pagination.service';
import { PaginationServiceStub } from '../../../../shared/testing/pagination-service.stub';
import { UnitGroupsListComponent } from './unit-groups-list.component';
import { UnitMockWithGroup } from 'src/app/shared/testing/unit-mock';
import { Unit } from 'src/app/core/eperson/models/unit.model';
import { UnitDataService } from 'src/app/core/eperson/unit-data.service';

describe('UnitGroupsListComponent', () => {
  let component: UnitGroupsListComponent;
  let fixture: ComponentFixture<UnitGroupsListComponent>;
  let translateService: TranslateService;
  let builderService: FormBuilderService;
  let unitsDataServiceStub: any;
  let groupDataServiceStub: any;
  let activeUnit;
  let allGroups;
  let unitGroups;
  let paginationService;

  beforeEach(waitForAsync(() => {
    activeUnit = UnitMockWithGroup;
    unitGroups = [GroupMock];
    allGroups = [GroupMock, GroupMock2];

    groupDataServiceStub = {
      activeUnit: activeUnit,
      unitGroups: unitGroups,
      findListByHref(href: string): Observable<RemoteData<PaginatedList<Group>>> {
        return createSuccessfulRemoteDataObject$(buildPaginatedList<Group>(new PageInfo(), unitsDataServiceStub.getGroups()));
      },
      searchGroups(query: string): Observable<RemoteData<PaginatedList<Group>>> {
        if (query === '') {
          return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), allGroups));
        }
        return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), []));
      },
      getGroupRegistryRouterLink(): string {
        return '/access-control/groups';
      },
      getGroupEditPageRouterLink(group: Group): string {
        return '/access-control/groups/' + group.id;
      },
    };
    unitsDataServiceStub = {
      activeUnit: activeUnit,
      unitGroups: unitGroups,
      allGroups: allGroups,
      getActiveUnit(): Observable<Unit> {
        return observableOf(activeUnit);
      },
      getGroups() {
        return this.unitGroups;
      },
      addGroupToUnit(_activeUnit, group: Group): Observable<RestResponse> {
        this.unitGroups = [...this.unitGroups, group];
        unitGroups = this.unitGroups;
        activeUnit.groups = this.unitGroups;
        return observableOf(new RestResponse(true, 200, 'Success'));
      },
      clearUnitsRequests() {
        // empty
      },
      clearGroupLinkRequests() {
        // empty
      },
      getUnitEditPageRouterLink(group: Group): string {
        return '/access-control/groups/' + group.id;
      },
      deleteGroupFromUnit(_activeUnit, groupToDelete: Group): Observable<RestResponse> {
        this.unitGroups = this.unitGroups.find((group: Group) => {
          if (group.id !== groupToDelete.id) {
            return group;
          }
        });
        if (this.unitGroups === undefined) {
          this.unitGroups = [];
        }
        return observableOf(new RestResponse(true, 200, 'Success'));
      }
    };
    builderService = getMockFormBuilderService();
    translateService = getMockTranslateService();

    paginationService = new PaginationServiceStub();
    TestBed.configureTestingModule({
      imports: [CommonModule, NgbModule, FormsModule, ReactiveFormsModule, BrowserModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        }),
      ],
      declarations: [UnitGroupsListComponent],
      providers: [UnitGroupsListComponent,
        { provide: UnitDataService, useValue: unitsDataServiceStub },
        { provide: GroupDataService, useValue: groupDataServiceStub },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: FormBuilderService, useValue: builderService },
        { provide: Router, useValue: new RouterMock() },
        { provide: PaginationService, useValue: paginationService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitGroupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(fakeAsync(() => {
    fixture.destroy();
    flush();
    component = null;
  }));

  it('should create UnitGroupsListComponent', inject([UnitGroupsListComponent], (comp: UnitGroupsListComponent) => {
    expect(comp).toBeDefined();
  }));

  it('should show list of groups of current active unit', () => {
    const groupIdsFound = fixture.debugElement.queryAll(By.css('#groupsOfUnit tr td:first-child'));
    expect(groupIdsFound.length).toEqual(1);
    unitGroups.map((group: Group) => {
      expect(groupIdsFound.find((foundEl) => {
        return (foundEl.nativeElement.textContent.trim() === group.uuid);
      })).toBeTruthy();
    });
  });

  describe('search', () => {
    describe('when searching without query', () => {
      let groupsFound;
      beforeEach(fakeAsync(() => {
        component.search({ scope: 'metadata', query: '' });
        tick();
        fixture.detectChanges();
        groupsFound = fixture.debugElement.queryAll(By.css('#groupsSearch tbody tr'));
      }));

      it('should display all groups', () => {
        expect(groupsFound.length).toEqual(2);
      });

      describe('if group is already assigned to the unit', () => {
        it('should have delete button, else it should have add button', () => {
          activeUnit.groups.map((group: Group) => {
            groupsFound.map((foundGroupRowElement) => {
              if (foundGroupRowElement !== undefined) {
                const groupId = foundGroupRowElement.query(By.css('td:first-child'));
                const addButton = foundGroupRowElement.query(By.css('td:last-child .fa-plus'));
                const deleteButton = foundGroupRowElement.query(By.css('td:last-child .fa-trash-alt'));
                if (groupId.nativeNode.textContent === group.id) {
                  expect(addButton).toBeNull();
                  expect(deleteButton).toBeDefined();
                } else {
                  expect(deleteButton).toBeNull();
                  expect(addButton).toBeDefined();
                }
              }
            });
          });
        });
      });
    });
  });
});
