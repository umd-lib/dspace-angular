import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DynamicCheckboxModel, DynamicFormControlModel, DynamicFormLayout, DynamicInputModel } from '@ng-dynamic-forms/core';
import { TranslateService } from '@ngx-translate/core';
import { Operation } from 'fast-json-patch';
import {
  combineLatest as observableCombineLatest,
  Observable,
  ObservedValueOf,
  Subscription,
} from 'rxjs';
import { catchError, map, switchMap, take, filter, debounceTime } from 'rxjs/operators';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { RequestService } from 'src/app/core/data/request.service';
import { Unit } from 'src/app/core/eperson/models/unit.model';
import { UnitDataService } from 'src/app/core/eperson/unit-data.service';
import { NoContent } from 'src/app/core/shared/NoContent.model';
import { getFirstCompletedRemoteData, getFirstSucceededRemoteData, getFirstSucceededRemoteDataPayload, getRemoteDataPayload } from 'src/app/core/shared/operators';
import { AlertType } from 'src/app/shared/alert/aletr-type';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import { hasValue, hasValueOperator, isNotEmpty } from 'src/app/shared/empty.util';
import { FormBuilderService } from 'src/app/shared/form/builder/form-builder.service';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { ValidateUnitExists } from './validators/unit-exists-validator';

@Component({
  selector: 'ds-unit-form',
  templateUrl: './unit-form.component.html'
})
/**
 * A form used for creating and editing units
 */
export class UnitFormComponent implements OnInit, OnDestroy {

  messagePrefix = 'admin.access-control.units.form';

  /**
   * A unique id used for ds-form
   */
  formId = 'unit-form';

  /**
   * Dynamic models for the inputs of form
   */
  unitName: DynamicInputModel;
  facultyOnly: DynamicCheckboxModel;

  /**
   * A list of all dynamic input models
   */
  formModel: DynamicFormControlModel[];

  /**
   * Layout used for structuring the form inputs
   */
  formLayout: DynamicFormLayout = {
    unitName: {
      grid: {
        host: 'row'
      }
    },
    facultyOnly: {
      grid: {
        host: 'row'
      }
    },
  };

  /**
   * A FormGroup that combines all inputs
   */
  formGroup: FormGroup;

  /**
   * An EventEmitter that's fired whenever the form is being submitted
   */
  @Output() submitForm: EventEmitter<any> = new EventEmitter();

  /**
   * An EventEmitter that's fired whenever the form is cancelled
   */
  @Output() cancelForm: EventEmitter<any> = new EventEmitter();

  /**
   * List of subscriptions
   */
  subs: Subscription[] = [];

  /**
   * Unit currently being edited
   */
  unitBeingEdited: Unit;

  /**
   * Observable whether or not the logged in user is allowed to edit the Unit
   */
  canEdit$: Observable<boolean>;

  /**
   * The AlertType enumeration
   * @type {AlertType}
   */
  public AlertTypeEnum = AlertType;

  /**
   * Subscription to unit name field value change
   */
  unitNameValueChangeSubscribe: Subscription;


  constructor(public unitDataService: UnitDataService,
    private formBuilderService: FormBuilderService,
    private translateService: TranslateService,
    private notificationsService: NotificationsService,
    private route: ActivatedRoute,
    protected router: Router,
    private authorizationService: AuthorizationDataService,
    private modalService: NgbModal,
    public requestService: RequestService,
    protected changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.initialisePage();
  }

  initialisePage() {
    this.subs.push(this.route.params.subscribe((params) => {
      if (params.unitId !== 'newUnit') {
        this.setActiveUnit(params.unitId);
      }
    }));
    this.canEdit$ = this.unitDataService.getActiveUnit().pipe(
      hasValueOperator(),
      switchMap((unit: Unit) => {
        return observableCombineLatest(
          this.authorizationService.isAuthorized(FeatureID.CanDelete, isNotEmpty(unit) ? unit.self : undefined),
          (isAuthorized: ObservedValueOf<Observable<boolean>>) => {
            return isAuthorized;
          });
      })
    );
    observableCombineLatest(
      this.translateService.get(`${this.messagePrefix}.unitName`),
      this.translateService.get(`${this.messagePrefix}.facultyOnly`),
    ).subscribe(([unitNameLabel, facultyOnlyLabel]) => {
      this.unitName = new DynamicInputModel({
        id: 'unitName',
        label: unitNameLabel,
        name: 'unitName',
        validators: {
          required: null,
        },
        required: true,
      });
      this.facultyOnly = new DynamicCheckboxModel({
        id: 'facultyOnly',
        label: facultyOnlyLabel,
        name: 'facultyOnly',
        required: false,
        value: false // Initial value
      });
      this.formModel = [
        this.unitName,
        this.facultyOnly,
      ];
      this.formGroup = this.formBuilderService.createFormGroup(this.formModel);

      if (!!this.formGroup.controls.unitName) {
        this.formGroup.controls.unitName.setAsyncValidators(ValidateUnitExists.createValidator(this.unitDataService));
        this.unitNameValueChangeSubscribe = this.unitName.valueChanges.pipe(debounceTime(300)).subscribe(() => {
          this.changeDetectorRef.detectChanges();
        });
      }

      this.subs.push(
        observableCombineLatest(
          this.unitDataService.getActiveUnit(),
          this.canEdit$
        ).subscribe(([activeUnit, canEdit]) => {

          if (activeUnit != null) {

            // Disable unit name exists validator
            this.formGroup.controls.unitName.clearAsyncValidators();

            this.unitBeingEdited = activeUnit;

            // if (linkedObject?.name) {
            //   this.formBuilderService.insertFormGroupControl(1, this.formGroup, this.formModel, this.groupCommunity);
            //   this.formGroup.patchValue({
            //     groupName: activeGroup.name,
            //     groupCommunity: linkedObject?.name ?? '',
            //     groupDescription: activeGroup.firstMetadataValue('dc.description'),
            //   });
            // } else {
              this.formModel = [
                this.unitName,
                this.facultyOnly,
              ];
              this.formGroup.patchValue({
                unitName: activeUnit.name,
                facultyOnly: activeUnit.facultyOnly,
              });
            // }
            setTimeout(() => {
              if (!canEdit) {
                this.formGroup.disable();
              }
            }, 200);
          }
        })
      );
    });
  }

  /**
   * Stop editing the currently selected unit
   */
  onCancel() {
    this.unitDataService.cancelEditUnit();
    this.cancelForm.emit();
    this.router.navigate([this.unitDataService.getUnitRegistryRouterLink()]);
  }

  /**
   * Submit the form
   */
  onSubmit() {
    this.unitDataService.getActiveUnit().pipe(take(1)).subscribe(
      (unit: Unit) => {
        const values = {
          name: this.unitName.value,
          facultyOnly: this.facultyOnly.checked
        };
        if (unit === null) {
          this.createNewUnit(values);
        } else {
          this.editUnit(unit);
        }
      }
    );
  }

  /**
   * Creates new Unit based on given values from form
   * @param values
   */
  createNewUnit(values) {
    const unitToCreate = Object.assign(new Unit(), values);
    this.unitDataService.create(unitToCreate).pipe(
      getFirstCompletedRemoteData()
    ).subscribe((rd: RemoteData<Unit>) => {
      if (rd.hasSucceeded) {
        this.notificationsService.success(this.translateService.get(this.messagePrefix + '.notification.created.success', { name: unitToCreate.name }));
        this.submitForm.emit(unitToCreate);
        if (isNotEmpty(rd.payload)) {
          const unitSelfLink = rd.payload._links.self.href;
          this.setActiveUnitWithLink(unitSelfLink);
          this.unitDataService.clearUnitsRequests();
          this.router.navigateByUrl(this.unitDataService.getUnitEditPageRouterLinkWithID(rd.payload.uuid));
        }
      } else {
        this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.created.failure', { name: unitToCreate.name }));
        this.showNotificationIfNameInUse(unitToCreate, 'created');
        this.cancelForm.emit();
      }
    });
  }

  /**
   * Checks for the given unit if there is already a unit in the system with
   * that unit name and shows error if that is the case
   * @param unit the unit to check
   * @param notificationSection whether in create or edit
   */
  private showNotificationIfNameInUse(unit: Unit, notificationSection: string) {
    // Relevant message for unit name in use
    this.subs.push(this.unitDataService.searchUnits(unit.name, {
      currentPage: 1,
      elementsPerPage: 0
    }).pipe(getFirstSucceededRemoteData(), getRemoteDataPayload())
      .subscribe((list: PaginatedList<Unit>) => {
        if (list.totalElements > 0) {
          this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.' + notificationSection + '.failure.unitNameInUse', {
            name: unit.name
          }));
        }
      }));
  }

  /**
   * Edit existing Unit based on given values from form and old Unit
   * @param unit Unit to edit and old values contained within
   */
  editUnit(unit: Unit) {
    let operations: Operation[] = [];

    if (hasValue(this.facultyOnly.value)) {
      operations = [...operations, {
        op: 'replace',
        path: '/facultyOnly',
        value: this.facultyOnly.value
      }];
    }

    if (hasValue(this.unitName.value)) {
      operations = [...operations, {
        op: 'replace',
        path: '/name',
        value: this.unitName.value
      }];
    }

    this.unitDataService.patch(unit, operations).pipe(
      getFirstCompletedRemoteData()
    ).subscribe((rd: RemoteData<Unit>) => {
      if (rd.hasSucceeded) {
        this.notificationsService.success(this.translateService.get(this.messagePrefix + '.notification.edited.success', { name: rd.payload.name }));
        this.submitForm.emit(rd.payload);
      } else {
        this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.edited.failure', { name: unit.name }));
        this.cancelForm.emit();
      }
    });
  }

  /**
   * Start editing the selected unit
   * @param unitId ID of unit to set as active
   */
  setActiveUnit(unitId: string) {
    this.unitDataService.cancelEditUnit();
    this.unitDataService.findById(unitId)
      .pipe(
        getFirstSucceededRemoteData(),
        getRemoteDataPayload())
      .subscribe((unit: Unit) => {
        this.unitDataService.editUnit(unit);
      });
  }

  /**
   * Start editing the selected unit
   * @param unitSelfLink Self link of Unit to set as active
   */
  setActiveUnitWithLink(unitSelfLink: string) {
    this.unitDataService.getActiveUnit().pipe(take(1)).subscribe((activeUnit: Unit) => {
      if (activeUnit === null) {
        this.unitDataService.cancelEditUnit();
        this.unitDataService.findByHref(unitSelfLink, false, false, followLink('groups'))
          .pipe(
            getFirstSucceededRemoteData(),
            getRemoteDataPayload())
          .subscribe((unit: Unit) => {
            this.unitDataService.editUnit(unit);
          });
      }
    });
  }

  /**
   * Deletes the Unit from the Repository. The Unit will be the only that this form is showing.
   * It'll either show a success or error message depending on whether the delete was successful or not.
   */
  delete() {
    this.unitDataService.getActiveUnit().pipe(take(1)).subscribe((unit: Unit) => {
      const modalRef = this.modalService.open(ConfirmationModalComponent);
      modalRef.componentInstance.dso = unit;
      modalRef.componentInstance.headerLabel = this.messagePrefix + '.delete-unit.modal.header';
      modalRef.componentInstance.infoLabel = this.messagePrefix + '.delete-unit.modal.info';
      modalRef.componentInstance.cancelLabel = this.messagePrefix + '.delete-unit.modal.cancel';
      modalRef.componentInstance.confirmLabel = this.messagePrefix + '.delete-unit.modal.confirm';
      modalRef.componentInstance.brandColor = 'danger';
      modalRef.componentInstance.confirmIcon = 'fas fa-trash';
      modalRef.componentInstance.response.pipe(take(1)).subscribe((confirm: boolean) => {
        if (confirm) {
          if (hasValue(unit.id)) {
            this.unitDataService.delete(unit.id).pipe(getFirstCompletedRemoteData())
              .subscribe((rd: RemoteData<NoContent>) => {
                if (rd.hasSucceeded) {
                  this.notificationsService.success(this.translateService.get(this.messagePrefix + '.notification.deleted.success', { name: unit.name }));
                  this.onCancel();
                } else {
                  this.notificationsService.error(
                    this.translateService.get(this.messagePrefix + '.notification.deleted.failure.title', { name: unit.name }),
                    this.translateService.get(this.messagePrefix + '.notification.deleted.failure.content', { cause: rd.errorMessage }));
                }
              });
          }
        }
      });
    });
  }

  /**
   * Cancel the current edit when component is destroyed & unsub all subscriptions
   */
  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    this.unitDataService.cancelEditUnit();
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());

    if ( hasValue(this.unitNameValueChangeSubscribe) ) {
      this.unitNameValueChangeSubscribe.unsubscribe();
    }

  }

  // /**
  //  * Check if group has a linked object (community or collection linked to a workflow group)
  //  * @param group
  //  */
  // hasLinkedDSO(group: Group): Observable<boolean> {
  //   if (hasValue(group) && hasValue(group._links.object.href)) {
  //     return this.getLinkedDSO(group).pipe(
  //       map((rd: RemoteData<DSpaceObject>) => {
  //         return hasValue(rd) && hasValue(rd.payload);
  //       }),
  //       catchError(() => observableOf(false)),
  //     );
  //   }
  // }

  // /**
  //  * Get group's linked object if it has one (community or collection linked to a workflow group)
  //  * @param group
  //  */
  // getLinkedDSO(group: Group): Observable<RemoteData<DSpaceObject>> {
  //   if (hasValue(group) && hasValue(group._links.object.href)) {
  //     if (group.object === undefined) {
  //       return this.dSpaceObjectDataService.findByHref(group._links.object.href);
  //     }
  //     return group.object;
  //   }
  // }

  // /**
  //  * Get the route to the edit roles tab of the group's linked object (community or collection linked to a workflow group) if it has one
  //  * @param group
  //  */
  // getLinkedEditRolesRoute(group: Group): Observable<string> {
  //   if (hasValue(group) && hasValue(group._links.object.href)) {
  //     return this.getLinkedDSO(group).pipe(
  //       map((rd: RemoteData<DSpaceObject>) => {
  //         if (hasValue(rd) && hasValue(rd.payload)) {
  //           const dso = rd.payload;
  //           switch ((dso as any).type) {
  //             case Community.type.value:
  //               return getCommunityEditRolesRoute(rd.payload.id);
  //             case Collection.type.value:
  //               return getCollectionEditRolesRoute(rd.payload.id);
  //           }
  //         }
  //       })
  //     );
  //   }
  // }
}
