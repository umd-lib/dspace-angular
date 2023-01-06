import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DynamicCheckboxModel, DynamicFormControlModel, DynamicFormLayout, DynamicInputModel } from '@ng-dynamic-forms/core';
import { TranslateService } from '@ngx-translate/core';
import { Operation } from 'fast-json-patch';
import {
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  Observable,
  ObservedValueOf,
  Subscription,
} from 'rxjs';
import { switchMap, take, debounceTime, map, startWith } from 'rxjs/operators';
import { AuthorizationDataService } from 'src/app/core/data/feature-authorization/authorization-data.service';
import { FeatureID } from 'src/app/core/data/feature-authorization/feature-id';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { RequestService } from 'src/app/core/data/request.service';
import { EtdUnit } from '../models/etdunit.model';
import { Collection } from '../../core/shared/collection.model';
import { EtdUnitDataService } from '../etdunit-data.service';
import { NoContent } from 'src/app/core/shared/NoContent.model';
import { getAllSucceededRemoteData, getFirstCompletedRemoteData, getFirstSucceededRemoteData, getRemoteDataPayload, toDSpaceObjectListRD } from 'src/app/core/shared/operators';
import { AlertType } from 'src/app/shared/alert/aletr-type';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import { hasValue, hasValueOperator, isNotEmpty } from 'src/app/shared/empty.util';
import { FormBuilderService } from 'src/app/shared/form/builder/form-builder.service';
import { NotificationsService } from 'src/app/shared/notifications/notifications.service';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { ValidateEtdUnitExists } from './validators/etdunit-exists-validator';
import { PaginatedSearchOptions } from 'src/app/shared/search/models/paginated-search-options.model';
import { CollectionDataService } from 'src/app/core/data/collection-data.service';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { SearchConfigurationService } from 'src/app/core/shared/search/search-configuration.service';
import { HALEndpointService } from 'src/app/core/shared/hal-endpoint.service';
import { URLCombiner } from 'src/app/core/url-combiner/url-combiner';

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
   * Search options
   */
  searchOptions$: Observable<PaginatedSearchOptions>;

  /**
   * List of collections that are mapped to the EtdUnit
   */
  etdunitCollectionsRD$: Observable<RemoteData<PaginatedList<Collection>>>;

  /**
   * List of collections to show under the "Map" tab
   * Collections that are not mapped to the etdunit
   */
  mappableCollectionsRD$: Observable<RemoteData<PaginatedList<Collection>>>;

  /**
   * Firing this observable (shouldUpdate$.next(true)) forces the two lists to reload themselves
   * Usually fired after the lists their cache is cleared (to force a new request to the REST API)
   */
  shouldUpdate$: BehaviorSubject<boolean>;

  /**
   * Track whether at least one search has been performed or not
   * As soon as at least one search has been performed, we display the search results
   */
  performedSearch = false;

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
    private collectionDataService: CollectionDataService,
    private searchConfigService: SearchConfigurationService,
    private searchService: SearchService,
    private halService: HALEndpointService,
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


            this.searchOptions$ = this.searchConfigService.paginatedSearchOptions;
            this.loadCollectionLists();
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

  /**
   * Load etdunitCollectionsRD$ with a fixed scope to only obtain the collections that own this etdunit
   * Load mappableCollectionsRD$ to only obtain collections that don't own this etdunit
   */
  loadCollectionLists() {
    this.shouldUpdate$ = new BehaviorSubject<boolean>(true);
    this.etdunitCollectionsRD$ = this.shouldUpdate$.pipe(
      switchMap(shouldUpdate => {
        if (shouldUpdate === true) {
          this.shouldUpdate$.next(false);
        }
        return this.collectionDataService.findListByHref(
          this.etdunitDataService.getMappedCollectionsEndpoint(this.etdunitBeingEdited.id),
          undefined,
          !shouldUpdate,
          false
        ).pipe(
          getAllSucceededRemoteData()
        );
      }),
    );

    const etdunitCollectionsAndOptions$ = observableCombineLatest(
      this.etdunitCollectionsRD$,
      this.searchOptions$
    );
    this.mappableCollectionsRD$ = etdunitCollectionsAndOptions$.pipe(
      switchMap(([etdunitCollectionsRD, searchOptions]) => {
        return this.searchService.search(Object.assign(new PaginatedSearchOptions(searchOptions), {
          query: this.buildQuery(etdunitCollectionsRD.payload.page, searchOptions.query),
          dsoTypes: [DSpaceObjectType.COLLECTION]
        }), 10000).pipe(
          toDSpaceObjectListRD(),
          startWith(undefined)
        );
      })
    ) as Observable<RemoteData<PaginatedList<Collection>>>;
  }

  /**
   * Map the etdunit to the selected collections and display notifications
   * @param {string[]} ids  The list of collection UUID's to map the etdunit to
   */
  mapCollections(ids: string[]) {

    // Map the collections found in ids to the etdunit
    const responses$ = observableCombineLatest(ids.map((id: string) =>
      this.etdunitDataService.addCollectionToEtdUnit(this.etdunitBeingEdited, this.getCollectionSelfUrl(id)).pipe(getFirstCompletedRemoteData())
    ));

    this.showNotifications(responses$, this.messagePrefix + '.collection-mapper.notifications.add');
  }

  /**
   * Remove the mapping of the selected collections from etdunit and display notifications
   * @param {string[]} ids  The list of collection UUID's to remove the mapping of the etdunit for
   */
  removeMappings(ids: string[]) {
    const responses$ = observableCombineLatest(ids.map((id: string) =>
      this.etdunitDataService.deleteCollectionIdFromEtdUnit(this.etdunitBeingEdited, id).pipe(getFirstCompletedRemoteData())
    ));
    this.showNotifications(responses$, this.messagePrefix + '.collection-mapper.notifications.remove');
  }

  private getCollectionSelfUrl(id: string): Observable<string> {
    return this.halService.getEndpoint('collections').pipe(
      map((href: string) => new URLCombiner(href, id).toString())
    );
  }

  /**
   * Display notifications
   * @param {Observable<RestResponse[]>} responses$   The responses after adding/removing a mapping
   * @param {string} messagePrefix                    The prefix to build the notification messages with
   */
  private showNotifications(responses$: Observable<RemoteData<NoContent>[]>, messagePrefix: string) {
    responses$.subscribe((responses: RemoteData<NoContent>[]) => {
      const successful = responses.filter((response: RemoteData<NoContent>) => response.hasSucceeded);
      const unsuccessful = responses.filter((response: RemoteData<NoContent>) => response.hasFailed);
      if (successful.length > 0) {
        const successMessages = observableCombineLatest([
          this.translateService.get(`${messagePrefix}.success.head`),
          this.translateService.get(`${messagePrefix}.success.content`, { amount: successful.length })
        ]);

        successMessages.subscribe(([head, content]) => {
          this.notificationsService.success(head, content);
        });
        this.shouldUpdate$.next(true);
      }
      if (unsuccessful.length > 0) {
        const unsuccessMessages = observableCombineLatest([
          this.translateService.get(`${messagePrefix}.error.head`),
          this.translateService.get(`${messagePrefix}.error.content`, { amount: unsuccessful.length })
        ]);

        unsuccessMessages.subscribe(([head, content]) => {
          this.notificationsService.error(head, content);
        });
      }
    });
  }

  /**
   * Build a query to exclude collections from
   * @param collections     The collections their UUIDs
   * @param query           The query to add to it
   */
  buildQuery(collections: Collection[], query: string): string {
    let result = query;
    for (const collection of collections) {
      result = this.addExcludeCollection(collection.id, result);
    }
    return result;
  }

  /**
   * Add an exclusion of a collection to a query
   * @param collectionId    The collection's UUID
   * @param query           The query to add the exclusion to
   */
  addExcludeCollection(collectionId: string, query: string): string {
    const excludeQuery = `-search.resourceid:${collectionId}`;
    if (isNotEmpty(query)) {
      return `${query} AND ${excludeQuery}`;
    } else {
      return excludeQuery;
    }
  }
}
