import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'; // UMD Customization for LIBDRUM-701
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
import { Observable, combineLatest as observableCombineLatest, map, } from 'rxjs';
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
export class CommunityFormComponent extends ComColFormComponent<Community> implements OnInit { // UMD Customization for LIBDRUM-701
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
    name: 'communityGroup'
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
    this.communityGroupsRD$ = this.cgService.findAll();

    const allCommunityGroups$ = this.communityGroupsRD$.pipe(
      getFirstSucceededRemoteData(),
      getRemoteDataPayload()
    );

    this.subs.push(
      observableCombineLatest(
        allCommunityGroups$
      ).subscribe(([allCommunityGroups]) => {
        this.communityGroups = allCommunityGroups.page;
      })
    );

    this.selectedCommunityGroupModel.options = this.communityGroups.map((cg: CommunityGroup) =>
      Object.assign({
        value: cg.id,
        label: cg.shortName
      }));

    this.dso.communityGroup.pipe(
      getAllSucceededRemoteDataPayload()
    ).subscribe((cg: CommunityGroup) => {
      this.originalCommunityGroup = cg;
      this.formGroup.patchValue({
        communityGroup: cg.id
      });
    });

    this.changeDetectorRef.detectChanges();
  }

  onSubmit() {
    const updatedValues = this.formGroup.getRawValue();
    const selectedCommunityGroup = this.communityGroups.find((cg: CommunityGroup) => cg.id === updatedValues.communityGroup);
    const isNewFormat = selectedCommunityGroup.id !== this.originalCommunityGroup.id;

    let community$;

    if (isNewFormat) {
      community$ = this.communityService.updateCommunityGroup(this.dso, selectedCommunityGroup).pipe(
        getFirstCompletedRemoteData(),
        map((cgResponse: RemoteData<Community>) => {
          if (hasValue(cgResponse) && cgResponse.hasFailed) {
            this.notificationsService.error(
              this.translate.get(`${this.type.value}.edit.notifications.error`),
              cgResponse.errorMessage
            );
          } else {
            return cgResponse.payload;
          }
        })
      );
    }

    super.onSubmit();
  }
  // End UMD Customization for LIBDRUM-701
}
