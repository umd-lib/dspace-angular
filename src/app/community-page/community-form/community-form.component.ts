import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core'; // UMD Customization for LIBDRUM-701
import {
  DynamicFormControlModel,
  DynamicFormService,
  DynamicInputModel,
  DynamicSelectModel, // UMD Customization for LIBDRUM-701
  DynamicTextAreaModel
} from '@ng-dynamic-forms/core';
import { Community } from '../../core/shared/community.model';
import { ComColFormComponent } from '../../shared/comcol/comcol-forms/comcol-form/comcol-form.component';
import { TranslateService } from '@ngx-translate/core';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { CommunityDataService } from '../../core/data/community-data.service';
import { AuthService } from '../../core/auth/auth.service';
import { RequestService } from '../../core/data/request.service';
import { ObjectCacheService } from '../../core/cache/object-cache.service';
// UMD Customization for LIBDRUM-701
import { hasValue } from 'src/app/shared/empty.util';
import { CommunityGroupDataService } from 'src/app/core/data/community-group-data.service';
import { CommunityGroup } from 'src/app/core/shared/community-group.model';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { Observable, combineLatest as observableCombineLatest, map, of as observableOf, } from 'rxjs';
import { getAllSucceededRemoteDataPayload, getFirstCompletedRemoteData, getFirstSucceededRemoteData, getRemoteDataPayload } from 'src/app/core/shared/operators';
// End UMD Customization for LIBDRUM-701

/**
 * Form used for creating and editing communities
 */
@Component({
  selector: 'ds-community-form',
  styleUrls: ['../../shared/comcol/comcol-forms/comcol-form/comcol-form.component.scss'],
  templateUrl: '../../shared/comcol/comcol-forms/comcol-form/comcol-form.component.html'
})
export class CommunityFormComponent extends ComColFormComponent<Community> implements OnInit, OnDestroy { // UMD Customization for LIBDRUM-701
  /**
   * @type {Community} A new community when a community is being created, an existing Input community when a community is being edited
   */
  @Input() dso: Community = new Community();

  /**
   * @type {Community.type} This is a community-type form
   */
  type = Community.type;

  // UMD Customization for LIBDRUM-701
  /**
   * The community groups their remote data observable
   * Tracks changes and updates the view
   */
  communityGroupsRD$: Observable<RemoteData<PaginatedList<CommunityGroup>>>;

  /**
  * The originally selected community group
  */
  originalCommunityGroup: CommunityGroup;

  /**
   * A list of all available community groups
   */
  communityGroups: CommunityGroup[];

  /**
   * The Dynamic Input Model for the selected format
   */
  selectedCommunityGroupModel = new DynamicSelectModel({
    id: 'communityGroup',
    name: 'communityGroup',
    required: true,
    validators: {
      required: null
    },
    errorMessages: {
      required: 'Please select a group'
    },
  });
  // End UMD Customization for LIBDRUM-701

  /**
   * The dynamic form fields used for creating/editing a community
   * @type {(DynamicInputModel | DynamicTextAreaModel)[]}
   */
  formModel: DynamicFormControlModel[] = [
    new DynamicInputModel({
      id: 'title',
      name: 'dc.title',
      required: true,
      validators: {
        required: null
      },
      errorMessages: {
        required: 'Please enter a name for this title'
      },
    }),
    this.selectedCommunityGroupModel, // UMD Customization for LIBDRUM-701
    new DynamicTextAreaModel({
      id: 'description',
      name: 'dc.description',
    }),
    new DynamicTextAreaModel({
      id: 'abstract',
      name: 'dc.description.abstract',
    }),
    new DynamicTextAreaModel({
      id: 'rights',
      name: 'dc.rights',
    }),
    new DynamicTextAreaModel({
      id: 'tableofcontents',
      name: 'dc.description.tableofcontents',
    }),
  ];

  public constructor(protected formService: DynamicFormService,
    private changeDetectorRef: ChangeDetectorRef, // UMD Customization for LIBDRUM-701
    protected translate: TranslateService,
    protected notificationsService: NotificationsService,
    protected authService: AuthService,
    protected dsoService: CommunityDataService,
    protected communityService: CommunityDataService, // UMD Customization for LIBDRUM-701
    protected cgService: CommunityGroupDataService, // UMD Customization for LIBDRUM-701
    protected requestService: RequestService,
    protected objectCache: ObjectCacheService) {
    super(formService, translate, notificationsService, authService, requestService, objectCache);
  }

  // UMD Customization for LIBDRUM-701
  ngOnInit(): void {
    super.ngOnInit();

    this.communityGroupsRD$ = this.cgService.findAll();

    const allCommunityGroups$ = this.communityGroupsRD$.pipe(
      getFirstSucceededRemoteData(),
      getRemoteDataPayload()
    );

    const currentCommunityGroup$ = this.dso.communityGroup === undefined ? observableOf(undefined) :
      this.dso.communityGroup.pipe(
        getFirstSucceededRemoteData(),
        getRemoteDataPayload()
      );

    this.subs.push(
      observableCombineLatest([
        allCommunityGroups$,
        currentCommunityGroup$
      ]).subscribe(([allCommunityGroups, currentCommunityGroup]) => {
        this.communityGroups = allCommunityGroups.page;
        this.originalCommunityGroup = currentCommunityGroup;
        this.updateCommunityGroupModel();
      })
    );

    this.changeDetectorRef.detectChanges();
  }

  updateCommunityGroupModel() {
    this.selectedCommunityGroupModel.options = this.communityGroups.map((cg: CommunityGroup) =>
      Object.assign({
        value: cg.id,
        label: cg.shortName
      })
    );
    if (this.originalCommunityGroup != undefined) {
      this.selectedCommunityGroupModel.value = this.originalCommunityGroup.id;
    }
  }

  onSubmit() {
    const selectedCommunityGroup = this.communityGroups.find((cg: CommunityGroup) => cg.id === this.selectedCommunityGroupModel.value);
    if (this.originalCommunityGroup == undefined ||
      (this.originalCommunityGroup != undefined && selectedCommunityGroup.id !== this.originalCommunityGroup.id)) {
      this.updateCommunityGroup = true;
    }
    super.onSubmit();
    this._refreshCache();
  }



  /**
   * Unsubscribe from open subscriptions
   */
  ngOnDestroy(): void {
    this.subs
      .filter((subscription) => hasValue(subscription))
      .forEach((subscription) => subscription.unsubscribe());
  }

  /**
   * Refresh the object's cache to ensure the latest version
   */
  private _refreshCache() {
    this.requestService.removeByHrefSubstring(this.dso._links.self.href);
    this.requestService.removeByHrefSubstring(this.dso._links.communityGroup.href);
    this.objectCache.remove(this.dso._links.communityGroup.href);
    this.objectCache.remove(this.dso._links.self.href);
  }
  // End UMD Customization for LIBDRUM-701
}
