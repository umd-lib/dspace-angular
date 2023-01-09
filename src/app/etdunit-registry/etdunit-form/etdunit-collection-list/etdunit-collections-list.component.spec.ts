import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of as observableOf } from 'rxjs';
import { RestResponse } from '../../../core/cache/response.models';
import { buildPaginatedList, PaginatedList } from '../../../core/data/paginated-list.model';
import { RemoteData } from '../../../core/data/remote-data';
import { PageInfo } from '../../../core/shared/page-info.model';
import { FormBuilderService } from '../../../shared/form/builder/form-builder.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from '../../../shared/remote-data.utils';
import { getMockTranslateService } from '../../../shared/mocks/translate.service.mock';
import { getMockFormBuilderService } from '../../../shared/mocks/form-builder-service.mock';
import { TranslateLoaderMock } from '../../../shared/testing/translate-loader.mock';
import { NotificationsServiceStub } from '../../../shared/testing/notifications-service.stub';
import { RouterMock } from '../../../shared/mocks/router.mock';
import { PaginationService } from '../../../core/pagination/pagination.service';
import { PaginationServiceStub } from '../../../shared/testing/pagination-service.stub';
import { EtdUnitCollectionsListComponent } from './etdunit-collections-list.component';
import { EtdUnitMockWithCollection } from 'src/app/shared/testing/etdunit-mock';
import { CollectionMock, CollectionMock2 } from 'src/app/shared/testing/collection-mock';
import { Collection } from 'src/app/core/shared/collection.model';
import { EtdUnit } from '../../models/etdunit.model';
import { EtdUnitDataService } from '../../etdunit-data.service';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { FollowLinkConfig } from 'src/app/shared/utils/follow-link-config.model';
import { FindListOptions } from 'src/app/core/data/find-list-options.model';

describe('EtdUnitCollectionsListComponent', () => {
  let component: EtdUnitCollectionsListComponent;
  let fixture: ComponentFixture<EtdUnitCollectionsListComponent>;
  let translateService: TranslateService;
  let builderService: FormBuilderService;
  let etdUnitsDataServiceStub: any;
  let collectionDataServiceStub: any;
  let activeEtdUnit;
  let allCollections;
  let etdUnitCollections;
  let paginationService;

  beforeEach(waitForAsync(() => {
    activeEtdUnit = EtdUnitMockWithCollection;
    etdUnitCollections = [CollectionMock];
    allCollections = [CollectionMock, CollectionMock2];

    collectionDataServiceStub = {
      activeEtdUnit: activeEtdUnit,
      etdUnitCollections: etdUnitCollections,
      findListByHref(href: string): Observable<RemoteData<PaginatedList<Collection>>> {
        return createSuccessfulRemoteDataObject$(buildPaginatedList<Collection>(new PageInfo(), etdUnitsDataServiceStub.getCollections()));
      },
      searchBy(searchMethod: string, options?: FindListOptions, useCachedVersionIfAvailable?: boolean, reRequestOnStale?: boolean, ...linksToFollow: FollowLinkConfig<Collection>[]): Observable<RemoteData<PaginatedList<Collection>>> {
        const query = options.searchParams[0].fieldValue;

        if (query === '') {
          return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), allCollections));
        }
        return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), []));
      },
    };
    etdUnitsDataServiceStub = {
      activeEtdUnit: activeEtdUnit,
      etdUnitCollections: etdUnitCollections,
      allCollections: allCollections,
      getActiveEtdUnit(): Observable<EtdUnit> {
        return observableOf(activeEtdUnit);
      },
      getCollections() {
        return this.etdUnitCollections;
      },
      addCollectionToEtdUnit(_activeUnit, collection: Collection): Observable<RestResponse> {
        this.etdUnitCollections = [...this.etdUnitCollections, collection];
        etdUnitCollections = this.etdUnitCollections;
        activeEtdUnit.collections = this.etdUnitCollections;
        return observableOf(new RestResponse(true, 200, 'Success'));
      },
      clearUnitsRequests() {
        // empty
      },
      clearGroupLinkRequests() {
        // empty
      },
      deleteCollectionFromEtdUnit(_activeEtdUnit, collectionToDelete: Collection): Observable<RestResponse> {
        this.etdUnitCollections = this.etdUnitCollections.find((collection: Collection) => {
          if (collection.id !== collectionToDelete.id) {
            return collection;
          }
        });
        if (this.etdUnitCollections === undefined) {
          this.etdUnitCollections = [];
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
      declarations: [EtdUnitCollectionsListComponent],
      providers: [
        EtdUnitCollectionsListComponent,
        { provide: EtdUnitDataService, useValue: etdUnitsDataServiceStub },
        { provide: CollectionDataService, useValue: collectionDataServiceStub },
        { provide: NotificationsService, useValue: new NotificationsServiceStub() },
        { provide: FormBuilderService, useValue: builderService },
        { provide: Router, useValue: new RouterMock() },
        { provide: PaginationService, useValue: paginationService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EtdUnitCollectionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(fakeAsync(() => {
    fixture.destroy();
    flush();
    component = null;
  }));

  it('should create UnitGroupsListComponent', inject([EtdUnitCollectionsListComponent], (comp: EtdUnitCollectionsListComponent) => {
    expect(comp).toBeDefined();
  }));

  it('should show list of collections of current active ETD unit', () => {
    const collectionIdsFound = fixture.debugElement.queryAll(By.css('#collectionsOfEtdUnit tr td:first-child'));
    expect(collectionIdsFound.length).toEqual(1);
    etdUnitCollections.map((collection: Collection) => {
      expect(collectionIdsFound.find((foundEl) => {
        return (foundEl.nativeElement.textContent.trim() === collection.uuid);
      })).toBeTruthy();
    });
  });

  describe('search', () => {
    describe('when searching without query', () => {
      let collectionsFound;
      beforeEach(fakeAsync(() => {
        component.search({ query: '' });
        tick();
        fixture.detectChanges();
        collectionsFound = fixture.debugElement.queryAll(By.css('#collectionsSearch tbody tr'));
      }));

      it('should display all collections', () => {
        expect(collectionsFound.length).toEqual(2);
      });

      describe('if collection is already assigned to the unit', () => {
        it('should have delete button, else it should have add button', () => {
          activeEtdUnit.collections.map((collection: Collection) => {
            collectionsFound.map((foundCollectionRowElement) => {
              if (foundCollectionRowElement !== undefined) {
                const groupId = foundCollectionRowElement.query(By.css('td:first-child'));
                const addButton = foundCollectionRowElement.query(By.css('td:last-child .fa-plus'));
                const deleteButton = foundCollectionRowElement.query(By.css('td:last-child .fa-trash-alt'));
                if (groupId.nativeNode.textContent === collection.id) {
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
