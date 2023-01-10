import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PaginationService } from 'ngx-pagination';
import { Observable, of as observableOf } from 'rxjs';
import { DSOChangeAnalyzer } from 'src/app/core/data/dso-change-analyzer.service';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { buildPaginatedList, PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { Collection } from 'src/app/core/shared/collection.model';
import { EtdUnit } from './models/etdunit.model';
import { EtdUnitDataService } from './etdunit-data.service';
import { RouteService } from 'src/app/core/services/route.service';
import { PageInfo } from 'src/app/core/shared/page-info.model';
import { RouterMock } from 'src/app/shared/mocks/router.mock';
import { TranslateLoaderMock } from 'src/app/shared/mocks/translate-loader.mock';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from 'src/app/shared/remote-data.utils';
import { NotificationsServiceStub } from 'src/app/shared/testing/notifications-service.stub';
import { PaginationServiceStub } from 'src/app/shared/testing/pagination-service.stub';
import { routeServiceStub } from 'src/app/shared/testing/route-service.stub';
import { EtdUnitMock, EtdUnitMock2 } from 'src/app/shared/testing/etdunit-mock';

import { EtdUnitsRegistryComponent } from './etdunits-registry.component';

describe('EtdUnitsRegistryComponent', () => {
  let component: EtdUnitsRegistryComponent;
  let fixture: ComponentFixture<EtdUnitsRegistryComponent>;
  let etdunitDataServiceStub: any;
  let collectionDataServiceStub: any;
  let authorizationService: AuthorizationDataService;
  let paginationService: any;
  let mockUnits: EtdUnit[];

  /**
   * Set authorizationService.isAuthorized to return the following values.
   * @param isAdmin whether or not the current user is an admin.
   */
  const setIsAuthorized = (isAdmin: boolean, etdunit: EtdUnit = undefined) => {
    (authorizationService as any).isAuthorized.and.callFake((featureId?: FeatureID) => {
      switch (featureId) {
        case FeatureID.AdministratorOf:
          return observableOf(isAdmin);
        case FeatureID.CanDelete:
          return observableOf(true);
        default:
          throw new Error(`setIsAuthorized: this fake implementation does not support ${featureId}.`);
      }
    });
  };


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        })],
    });
  });

  authorizationService = jasmine.createSpyObj('authorizationService', ['isAuthorized']);
  paginationService = new PaginationServiceStub();

  beforeEach(waitForAsync(() => {
    mockUnits = [EtdUnitMock, EtdUnitMock2];
    etdunitDataServiceStub = {
      allUnits: mockUnits,
      searchEtdUnits(query: string): Observable<RemoteData<PaginatedList<EtdUnit>>> {
        switch (query) {
          case '': {
            return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo({
              elementsPerPage: this.allUnits.length,
              totalElements: this.allUnits.length,
              totalPages: 1,
              currentPage: 1
            }), this.allUnits));
          }
          case 'query_with_no_results':
            return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo({
              elementsPerPage: 1,
              totalElements: 0,
              totalPages: 0,
              currentPage: 1
            }), []));
          case 'query_with_one_result':
            return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo({
              elementsPerPage: 1,
              totalElements: 1,
              totalPages: 1,
              currentPage: 1
            }), [EtdUnitMock]));
        }
      },
      getEtdUnitEditPageRouterLink(etdunit: EtdUnit): string {
        return '/access-control/etdunit/' + etdunit.id;
      }
    };
    collectionDataServiceStub = {
      findListByHref(href: string): Observable<RemoteData<PaginatedList<Collection>>> {
        return createSuccessfulRemoteDataObject$(buildPaginatedList<Collection>(new PageInfo(), []));
      },
    };
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EtdUnitsRegistryComponent],
      providers: [
        DSOChangeAnalyzer,
        { provide: EtdUnitDataService, useValue: etdunitDataServiceStub },
        { provide: CollectionDataService, useValue: collectionDataServiceStub },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: PaginationService, useValue: paginationService },
        { provide: RouteService, useValue: routeServiceStub },
        { provide: Router, useValue: new RouterMock() },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EtdUnitsRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('search', () => {
    describe('when searching with query', () => {
      beforeEach(fakeAsync(() => {
        setIsAuthorized(true);
      }));

      it('should display a message when no results are found', fakeAsync(() => {
        let etdunitIdsFound;
        component.search({ query: 'query_with_no_results' });
        tick();
        fixture.detectChanges();
        etdunitIdsFound = fixture.debugElement.queryAll(By.css('#etdunits tr td:first-child'));

        expect(etdunitIdsFound.length).toEqual(0);
        expect(fixture.nativeElement.innerText).toContain('admin.core.etdunits.no-items');
      }));

      it('should display search results when results are found', fakeAsync(() => {
        let etdunitIdsFound;
        component.search({ query: 'query_with_one_result' });
        tick();
        fixture.detectChanges();
        etdunitIdsFound = fixture.debugElement.queryAll(By.css('#etdunits tr td:first-child'));

        expect(etdunitIdsFound.length).toEqual(1);
        expect(etdunitIdsFound.find((foundEl) => {
          return (foundEl.nativeElement.textContent.trim() === EtdUnitMock.uuid);
        })).toBeTruthy();
      }));
    });
  });

  describe('edit buttons', () => {
    describe('when the user is a general admin', () => {
      beforeEach(fakeAsync(() => {
        setIsAuthorized(true);

        // force rerender after setup changes
        component.search({ query: '' });
        tick();
        fixture.detectChanges();
      }));

      it('should be active', () => {
        const editButtonsFound = fixture.debugElement.queryAll(By.css('#etdunits tr td:nth-child(4) button.btn-edit'));
        expect(editButtonsFound.length).toEqual(2);
        editButtonsFound.forEach((editButtonFound) => {
          expect(editButtonFound.nativeElement.disabled).toBeFalse();
        });
      });
    });

    describe('when the user can not edit the collections', () => {
      beforeEach(fakeAsync(() => {
        setIsAuthorized(false);

        // force rerender after setup changes
        component.search({ query: '' });
        tick();
        fixture.detectChanges();
      }));

      it('should not be active', () => {
        const editButtonsFound = fixture.debugElement.queryAll(By.css('#etdunits tr td:nth-child(4) button.btn-edit'));
        expect(editButtonsFound.length).toEqual(2);
        editButtonsFound.forEach((editButtonFound) => {
          expect(editButtonFound.nativeElement.disabled).toBeTrue();
        });
      });
    });
  });
});
