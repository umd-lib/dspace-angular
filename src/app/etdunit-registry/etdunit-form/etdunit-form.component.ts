import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DynamicFormControlModel, DynamicFormLayout, DynamicInputModel } from '@ng-dynamic-forms/core';
import { TranslateService } from '@ngx-translate/core';
import { Operation } from 'fast-json-patch';
import {
  combineLatest as observableCombineLatest,
  Observable,
  Subscription,
} from 'rxjs';
import { take, debounceTime } from 'rxjs/operators';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { RequestService } from 'src/app/core/data/request.service';
import { EtdUnit } from '../models/etdunit.model';
import { EtdUnitDataService } from '../etdunit-data.service';
import { NoContent } from 'src/app/core/shared/NoContent.model';
import { getFirstCompletedRemoteData, getFirstSucceededRemoteData, getRemoteDataPayload } from 'src/app/core/shared/operators';
import { AlertType } from 'src/app/shared/alert/aletr-type';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import { hasValue, isNotEmpty } from 'src/app/shared/empty.util';
import { FormBuilderService } from 'src/app/shared/form/builder/form-builder.service';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { ValidateEtdUnitExists } from './validators/etdunit-exists-validator';

@Component({
  selector: 'ds-etdunit-form',
  templateUrl: './etdunit-form.component.html'
})
/**
 * A form used for creating and editing etdunits
 */
export class EtdUnitFormComponent implements OnInit, OnDestroy {

  messagePrefix = 'admin.core.etdunits.form';

  /**
   * A unique id used for ds-form
   */
  formId = 'etdunit-form';

  /**
   * Dynamic models for the inputs of form
   */
  etdunitName: DynamicInputModel;

  /**
   * A list of all dynamic input models
   */
  formModel: DynamicFormControlModel[];

  /**
   * Layout used for structuring the form inputs
   */
  formLayout: DynamicFormLayout = {
    etdunitName: {
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
   * EtdUnit currently being edited
   */
  etdunitBeingEdited: EtdUnit;

  /**
   * Observable whether or not the logged in user is allowed to edit the EtdUnit
   */
  canEdit$: Observable<boolean>;

  /**
   * The AlertType enumeration
   * @type {AlertType}
   */
  public AlertTypeEnum = AlertType;

  /**
   * Subscription to etdunit name field value change
   */
  etdunitNameValueChangeSubscribe: Subscription;

  constructor(
    public etdunitDataService: EtdUnitDataService,
    private formBuilderService: FormBuilderService,
    private translateService: TranslateService,
    private notificationsService: NotificationsService,
    private route: ActivatedRoute,
    protected router: Router,
    private authorizationService: AuthorizationDataService,
    private modalService: NgbModal,
    public requestService: RequestService,
    protected changeDetectorRef: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.initialisePage();
  }

  initialisePage() {
    this.subs.push(this.route.params.subscribe((params) => {
      if (params.etdunitId !== 'newEtdUnit') {
        this.setActiveEtdUnit(params.etdunitId);
      }
    }));
    this.canEdit$ = this.authorizationService.isAuthorized(FeatureID.AdministratorOf);
    observableCombineLatest(this.translateService.get(`${this.messagePrefix}.etdunitName`)).subscribe(([etdunitNameLabel]) => {
      this.etdunitName = new DynamicInputModel({
        id: 'etdunitName',
        label: etdunitNameLabel,
        name: 'etdunitName',
        validators: {
          required: null,
        },
        required: true,
      });
      this.formModel = [
        this.etdunitName,
      ];
      this.formGroup = this.formBuilderService.createFormGroup(this.formModel);

      if (!!this.formGroup.controls.etdunitName) {
        this.formGroup.controls.etdunitName.setAsyncValidators(ValidateEtdUnitExists.createValidator(this.etdunitDataService));
        this.etdunitNameValueChangeSubscribe = this.etdunitName.valueChanges.pipe(debounceTime(300)).subscribe(() => {
          this.changeDetectorRef.detectChanges();
        });
      }

      this.subs.push(
        observableCombineLatest(
          this.etdunitDataService.getActiveEtdUnit(),
          this.canEdit$
        ).subscribe(([activeEtdUnit, canEdit]) => {
          if (activeEtdUnit != null) {
            // Disable etdunit name exists validator
            this.formGroup.controls.etdunitName.clearAsyncValidators();

            this.etdunitBeingEdited = activeEtdUnit;

            this.formModel = [
              this.etdunitName,
            ];
            this.formGroup.patchValue({
              etdunitName: activeEtdUnit.name,
            });

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
   * Stop editing the currently selected etdunit
   */
  onCancel() {
    this.etdunitDataService.cancelEditEtdUnit();
    this.cancelForm.emit();
    this.router.navigate([this.etdunitDataService.getEtdUnitRegistryRouterLink()]);
  }

  /**
   * Submit the form
   */
  onSubmit() {
    this.etdunitDataService.getActiveEtdUnit().pipe(take(1)).subscribe(
      (etdunit: EtdUnit) => {
        const values = {
          name: this.etdunitName.value,
        };
        if (etdunit === null) {
          this.createNewEtdUnit(values);
        } else {
          this.editEtdUnit(etdunit);
        }
      }
    );
  }

  /**
   * Creates new EtdUnit based on given values from form
   * @param values
   */
  createNewEtdUnit(values) {
    const etdunitToCreate = Object.assign(new EtdUnit(), values);
    this.etdunitDataService.create(etdunitToCreate).pipe(
      getFirstCompletedRemoteData()
    ).subscribe((rd: RemoteData<EtdUnit>) => {
      if (rd.hasSucceeded) {
        this.notificationsService.success(this.translateService.get(this.messagePrefix + '.notification.created.success', { name: etdunitToCreate.name }));
        this.submitForm.emit(etdunitToCreate);
        if (isNotEmpty(rd.payload)) {
          const etdunitSelfLink = rd.payload._links.self.href;
          this.setActiveEtdUnitWithLink(etdunitSelfLink);
          this.etdunitDataService.clearEtdUnitsRequests();
          this.router.navigateByUrl(this.etdunitDataService.getEtdUnitEditPageRouterLinkWithID(rd.payload.uuid));
        }
      } else {
        this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.created.failure', { name: etdunitToCreate.name }));
        this.showNotificationIfNameInUse(etdunitToCreate, 'created');
        this.cancelForm.emit();
      }
    });
  }

  /**
   * Checks for the given etdunit if there is already a etdunit in the system with
   * that etdunit name and shows error if that is the case
   * @param etdunit the etdunit to check
   * @param notificationSection whether in create or edit
   */
  private showNotificationIfNameInUse(etdunit: EtdUnit, notificationSection: string) {
    // Relevant message for etdunit name in use
    this.subs.push(this.etdunitDataService.searchEtdUnits(etdunit.name, {
      currentPage: 1,
      elementsPerPage: 0
    }).pipe(getFirstSucceededRemoteData(), getRemoteDataPayload())
      .subscribe((list: PaginatedList<EtdUnit>) => {
        if (list.totalElements > 0) {
          this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.' + notificationSection + '.failure.etdunitNameInUse', {
            name: etdunit.name
          }));
        }
      }));
  }

  /**
   * Edit existing EtdUnit based on given values from form and old EtdUnit
   * @param etdunit EtdUnit to edit and old values contained within
   */
  editEtdUnit(etdunit: EtdUnit) {
    let operations: Operation[] = [];

    if (hasValue(this.etdunitName.value)) {
      operations = [...operations, {
        op: 'replace',
        path: '/name',
        value: this.etdunitName.value
      }];
    }

    this.etdunitDataService.patch(etdunit, operations).pipe(
      getFirstCompletedRemoteData()
    ).subscribe((rd: RemoteData<EtdUnit>) => {
      if (rd.hasSucceeded) {
        this.notificationsService.success(this.translateService.get(this.messagePrefix + '.notification.edited.success', { name: rd.payload.name }));
        this.submitForm.emit(rd.payload);
      } else {
        this.notificationsService.error(this.translateService.get(this.messagePrefix + '.notification.edited.failure', { name: etdunit.name }));
        this.cancelForm.emit();
      }
    });
  }

  /**
   * Start editing the selected etdunit
   * @param etdunitId ID of etdunit to set as active
   */
  setActiveEtdUnit(etdunitId: string) {
    this.etdunitDataService.cancelEditEtdUnit();
    if (etdunitId !== 'newEtdUnit') {
      this.etdunitDataService.findById(etdunitId)
        .pipe(
          getFirstSucceededRemoteData(),
          getRemoteDataPayload())
        .subscribe((etdunit: EtdUnit) => {
          this.etdunitDataService.editEtdUnit(etdunit);
        });
    }
  }

  /**
   * Start editing the selected etdunit
   * @param etdunitSelfLink Self link of EtdUnit to set as active
   */
  setActiveEtdUnitWithLink(etdunitSelfLink: string) {
    this.etdunitDataService.getActiveEtdUnit().pipe(take(1)).subscribe((activeEtdUnit: EtdUnit) => {
      if (activeEtdUnit === null) {
        this.etdunitDataService.cancelEditEtdUnit();
        this.etdunitDataService.findByHref(etdunitSelfLink, false, false, followLink('collections'))
          .pipe(
            getFirstSucceededRemoteData(),
            getRemoteDataPayload())
          .subscribe((etdunit: EtdUnit) => {
            this.etdunitDataService.editEtdUnit(etdunit);
          });
      }
    });
  }

  /**
   * Deletes the EtdUnit from the Repository. The EtdUnit will be the one that this form is showing.
   * It'll either show a success or error message depending on whether the delete was successful or not.
   */
  delete() {
    this.etdunitDataService.getActiveEtdUnit().pipe(take(1)).subscribe((etdunit: EtdUnit) => {
      const modalRef = this.modalService.open(ConfirmationModalComponent);
      modalRef.componentInstance.dso = etdunit;
      modalRef.componentInstance.headerLabel = this.messagePrefix + '.delete-etdunit.modal.header';
      modalRef.componentInstance.infoLabel = this.messagePrefix + '.delete-etdunit.modal.info';
      modalRef.componentInstance.cancelLabel = this.messagePrefix + '.delete-etdunit.modal.cancel';
      modalRef.componentInstance.confirmLabel = this.messagePrefix + '.delete-etdunit.modal.confirm';
      modalRef.componentInstance.brandColor = 'danger';
      modalRef.componentInstance.confirmIcon = 'fas fa-trash';
      modalRef.componentInstance.response.pipe(take(1)).subscribe((confirm: boolean) => {
        if (confirm) {
          if (hasValue(etdunit.id)) {
            this.etdunitDataService.delete(etdunit.id).pipe(getFirstCompletedRemoteData())
              .subscribe((rd: RemoteData<NoContent>) => {
                if (rd.hasSucceeded) {
                  this.notificationsService.success(this.translateService.get(this.messagePrefix + '.notification.deleted.success', { name: etdunit.name }));
                  this.onCancel();
                } else {
                  this.notificationsService.error(
                    this.translateService.get(this.messagePrefix + '.notification.deleted.failure.title', { name: etdunit.name }),
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
    this.etdunitDataService.cancelEditEtdUnit();
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());

    if (hasValue(this.etdunitNameValueChangeSubscribe)) {
      this.etdunitNameValueChangeSubscribe.unsubscribe();
    }
  }
}
