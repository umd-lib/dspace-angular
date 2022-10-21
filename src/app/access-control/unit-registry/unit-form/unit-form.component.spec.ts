import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule, By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

import { Operation } from 'fast-json-patch';
import { Observable, of as observableOf } from 'rxjs';
import { RemoteDataBuildService } from 'src/app/core/cache/builders/remote-data-build.service';
import { ObjectCacheService } from 'src/app/core/cache/object-cache.service';
import { DSOChangeAnalyzer } from 'src/app/core/data/dso-change-analyzer.service';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { buildPaginatedList, PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { Unit } from 'src/app/core/eperson/models/unit.model';
import { UnitDataService } from 'src/app/core/eperson/unit-data.service';
import { HALEndpointService } from 'src/app/core/shared/hal-endpoint.service';
import { NoContent } from 'src/app/core/shared/NoContent.model';
import { PageInfo } from 'src/app/core/shared/page-info.model';
import { UUIDService } from 'src/app/core/shared/uuid.service';
import { FormBuilderService } from 'src/app/shared/form/builder/form-builder.service';
import { getMockFormBuilderService } from 'src/app/shared/mocks/form-builder-service.mock';
import { RouterMock } from 'src/app/shared/mocks/router.mock';
import { TranslateLoaderMock } from 'src/app/shared/mocks/translate-loader.mock';
import { getMockTranslateService } from 'src/app/shared/mocks/translate.service.mock';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject$ } from 'src/app/shared/remote-data.utils';
import { NotificationsServiceStub } from 'src/app/shared/testing/notifications-service.stub';
import { UnitMock, UnitMock2 } from 'src/app/shared/testing/unit-mock';
import { ValidateUnitExists } from './validators/unit-exists-validator';
import { UnitFormComponent } from './unit-form.component';

describe('UnitFormComponent', () => {
  let component: UnitFormComponent;
  let fixture: ComponentFixture<UnitFormComponent>;
  let translateService: TranslateService;
  let builderService: FormBuilderService;
  let unitsDataServiceStub: any;
  let authorizationService: AuthorizationDataService;
  let notificationService: NotificationsServiceStub;
  let router;

  let units: Unit[];
  let unitName: string;
  let facultyOnly: boolean;
  let expected;

  beforeEach(waitForAsync(() => {
    units = [UnitMock, UnitMock2];
    unitName = 'testUnitName';
    facultyOnly = false;
    expected = Object.assign(new Unit(), {
      name: unitName,
      facultyOnly: facultyOnly
    });
    unitsDataServiceStub = {
      allUnits: units,
      activeUnit: null,
      createdUnit: null,
      getActiveUnit(): Observable<Unit> {
        return observableOf(this.activeUnit);
      },
      getUnitRegistryRouterLink(): string {
        return '/access-control/units';
      },
      editUnit(unit: Unit) {
        this.activeUnit = unit;
      },
      clearUnitsRequests() {
        return null;
      },
      patch(unit: Unit, operations: Operation[]) {
        return null;
      },
      delete(objectId: string, copyVirtualMetadata?: string[]): Observable<RemoteData<NoContent>> {
        return createSuccessfulRemoteDataObject$({});
      },
      cancelEditUnit(): void {
        this.activeUnit = null;
      },
      findById(id: string) {
        return observableOf({ payload: null, hasSucceeded: true });
      },
      findByHref(href: string) {
        return createSuccessfulRemoteDataObject$(this.createdUnit);
      },
      create(unit: Unit): Observable<RemoteData<Unit>> {
        this.allUnits = [...this.allUnits, unit];
        this.createdUnit = Object.assign({}, unit, {
          _links: { self: { href: 'unit-selflink' } }
        });
        return createSuccessfulRemoteDataObject$(this.createdUnit);
      },
      searchUnits(query: string): Observable<RemoteData<PaginatedList<Unit>>> {
        return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), []));
      },
      getUnitEditPageRouterLinkWithID(id: string) {
        return `unit-edit-page-for-${id}`;
      }
    };
    authorizationService = jasmine.createSpyObj('authorizationService', {
      isAuthorized: observableOf(true)
    });
    builderService = Object.assign(getMockFormBuilderService(),{
      createFormGroup(formModel, options = null) {
        const controls = {};
        formModel.forEach( model => {
            model.parent = parent;
            const controlModel = model;
            const controlState = { value: controlModel.value, disabled: controlModel.disabled };
            const controlOptions = this.createAbstractControlOptions(controlModel.validators, controlModel.asyncValidators, controlModel.updateOn);
            controls[model.id] = new FormControl(controlState, controlOptions);
        });
        return new FormGroup(controls, options);
      },
      createAbstractControlOptions(validatorsConfig = null, asyncValidatorsConfig = null, updateOn = null) {
        return {
            validators: validatorsConfig !== null ? this.getValidators(validatorsConfig) : null,
        };
      },
      getValidators(validatorsConfig) {
          return this.getValidatorFns(validatorsConfig);
      },
      getValidatorFns(validatorsConfig, validatorsToken = this._NG_VALIDATORS) {
        let validatorFns = [];
        if (this.isObject(validatorsConfig)) {
            validatorFns = Object.keys(validatorsConfig).map(validatorConfigKey => {
                const validatorConfigValue = validatorsConfig[validatorConfigKey];
                if (this.isValidatorDescriptor(validatorConfigValue)) {
                    const descriptor = validatorConfigValue;
                    return this.getValidatorFn(descriptor.name, descriptor.args, validatorsToken);
                }
                return this.getValidatorFn(validatorConfigKey, validatorConfigValue, validatorsToken);
            });
        }
        return validatorFns;
      },
      getValidatorFn(validatorName, validatorArgs = null, validatorsToken = this._NG_VALIDATORS) {
        let validatorFn;
        if (Validators.hasOwnProperty(validatorName)) { // Built-in Angular Validators
            validatorFn = Validators[validatorName];
        } else { // Custom Validators
            if (this._DYNAMIC_VALIDATORS && this._DYNAMIC_VALIDATORS.has(validatorName)) {
                validatorFn = this._DYNAMIC_VALIDATORS.get(validatorName);
            } else if (validatorsToken) {
                validatorFn = validatorsToken.find(validator => validator.name === validatorName);
            }
        }
        if (validatorFn === undefined) { // throw when no validator could be resolved
            throw new Error(`validator '${validatorName}' is not provided via NG_VALIDATORS, NG_ASYNC_VALIDATORS or DYNAMIC_FORM_VALIDATORS`);
        }
        if (validatorArgs !== null) {
            return validatorFn(validatorArgs);
        }
        return validatorFn;
    },
      isValidatorDescriptor(value) {
          if (this.isObject(value)) {
              return value.hasOwnProperty('name') && value.hasOwnProperty('args');
          }
          return false;
      },
      isObject(value) {
        return typeof value === 'object' && value !== null;
      }
    });
    translateService = getMockTranslateService();
    router = new RouterMock();
    notificationService = new NotificationsServiceStub();
    TestBed.configureTestingModule({
      imports: [CommonModule, NgbModule, FormsModule, ReactiveFormsModule, BrowserModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateLoaderMock
          }
        }),
      ],
      declarations: [UnitFormComponent],
      providers: [UnitFormComponent,
        { provide: UnitDataService, useValue: unitsDataServiceStub },
        { provide: NotificationsService, useValue: notificationService },
        { provide: FormBuilderService, useValue: builderService },
        { provide: DSOChangeAnalyzer, useValue: {} },
        { provide: HttpClient, useValue: {} },
        { provide: ObjectCacheService, useValue: {} },
        { provide: UUIDService, useValue: {} },
        { provide: Store, useValue: {} },
        { provide: RemoteDataBuildService, useValue: {} },
        { provide: HALEndpointService, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: { data: observableOf({ dso: { payload: {} } }), params: observableOf({}) }
        },
        { provide: Router, useValue: router },
        { provide: AuthorizationDataService, useValue: authorizationService },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when submitting the form', () => {
    beforeEach(() => {
      spyOn(component.submitForm, 'emit');
      component.unitName.value = unitName;
      component.facultyOnly.value = facultyOnly;
    });
    describe('without active Unit', () => {
      beforeEach(() => {
        component.onSubmit();
        fixture.detectChanges();
      });

      it('should emit a new unit using the correct values', waitForAsync(() => {
        fixture.whenStable().then(() => {
          expect(component.submitForm.emit).toHaveBeenCalledWith(expected);
        });
      }));
    });
    describe('with active Unit', () => {
      let expected2;
      beforeEach(() => {
        expected2 = Object.assign(new Unit(), {
          name: 'newUnitName',
          facultyOnly: false
        });
        spyOn(unitsDataServiceStub, 'getActiveUnit').and.returnValue(observableOf(expected));
        spyOn(unitsDataServiceStub, 'patch').and.returnValue(createSuccessfulRemoteDataObject$(expected2));
        component.unitName.value = 'newGroupName';
        component.onSubmit();
        fixture.detectChanges();
      });

      it('should emit the existing unit using the correct new values', waitForAsync(() => {
        fixture.whenStable().then(() => {
          expect(component.submitForm.emit).toHaveBeenCalledWith(expected2);
        });
      }));
      it('should emit success notification', () => {
        expect(notificationService.success).toHaveBeenCalled();
      });
    });
  });

  describe('ngOnDestroy', () => {
    it('does NOT call router.navigate', () => {
      component.ngOnDestroy();
      expect(router.navigate).toHaveBeenCalledTimes(0);
    });
  });


  describe('check form validation', () => {
    beforeEach(() => {
      unitName = 'testName';

      expected = Object.assign(new Unit(), {
        name: unitName,
        facultyOnly: true
      });
      spyOn(component.submitForm, 'emit');

      fixture.detectChanges();
      component.initialisePage();
      fixture.detectChanges();
    });
    describe('unitName should be required', () => {
      it('form should be invalid because the unitName is required', waitForAsync(() => {
        fixture.whenStable().then(() => {
          expect(component.formGroup.controls.unitName.valid).toBeFalse();
          expect(component.formGroup.controls.unitName.errors.required).toBeTrue();
        });
      }));
    });

    describe('after inserting information unitName', () => {
      beforeEach(() => {
        component.formGroup.controls.unitName.setValue('test');
        fixture.detectChanges();
      });
      it('unitName should be valid because the unitName is set', waitForAsync(() => {
        fixture.whenStable().then(() => {
          expect(component.formGroup.controls.unitName.valid).toBeTrue();
          expect(component.formGroup.controls.unitName.errors).toBeNull();
        });
      }));
    });

    describe('after already utilized unitName', () => {
      beforeEach(() => {
        const unitsDataServiceStubWithUnit = Object.assign(unitsDataServiceStub,{
          searchUnits(query: string): Observable<RemoteData<PaginatedList<Unit>>> {
            return createSuccessfulRemoteDataObject$(buildPaginatedList(new PageInfo(), [expected]));
          }
        });
        component.formGroup.controls.unitName.setValue('testName');
        component.formGroup.controls.unitName.setAsyncValidators(ValidateUnitExists.createValidator(unitsDataServiceStubWithUnit));
        fixture.detectChanges();
      });

      it('unitName should not be valid because unitName is already taken', waitForAsync(() => {
        fixture.whenStable().then(() => {
          expect(component.formGroup.controls.unitName.valid).toBeFalse();
          expect(component.formGroup.controls.unitName.errors.unitExists).toBeTruthy();
        });
      }));
    });
  });

  describe('delete', () => {
    let deleteButton;

    beforeEach(() => {
      component.initialisePage();

      component.canEdit$ = observableOf(true);
      component.unitBeingEdited = {
        facultyOnly: false
      } as Unit;

      fixture.detectChanges();
      deleteButton = fixture.debugElement.query(By.css('.delete-button')).nativeElement;

      spyOn(unitsDataServiceStub, 'delete').and.callThrough();
      spyOn(unitsDataServiceStub, 'getActiveUnit').and.returnValue(observableOf({ id: 'active-unit' }));
    });

    describe('if confirmed via modal', () => {
      beforeEach(waitForAsync(() => {
        deleteButton.click();
        fixture.detectChanges();
        (document as any).querySelector('.modal-footer .confirm').click();
      }));

      it('should call UnitDataService.delete', () => {
        expect(unitsDataServiceStub.delete).toHaveBeenCalledWith('active-unit');
      });
    });

    describe('if canceled via modal', () => {
      beforeEach(waitForAsync(() => {
        deleteButton.click();
        fixture.detectChanges();
        (document as any).querySelector('.modal-footer .cancel').click();
      }));

      it('should not call UnitDataService.delete', () => {
        expect(unitsDataServiceStub.delete).not.toHaveBeenCalled();
      });
    });
  });
});
