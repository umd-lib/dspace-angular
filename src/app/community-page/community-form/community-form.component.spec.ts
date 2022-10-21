import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DynamicFormControlModel, DynamicFormService } from '@ng-dynamic-forms/core';
import { TranslateModule } from '@ngx-translate/core';
import { of as observableOf } from 'rxjs';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ObjectCacheService } from 'src/app/core/cache/object-cache.service';
import { CommunityDataService } from 'src/app/core/data/community-data.service';
import { CommunityGroupDataService } from 'src/app/core/data/community-group-data.service';
import { RequestService } from 'src/app/core/data/request.service';
import { CommunityGroup } from 'src/app/core/shared/community-group.model';
import { Community } from 'src/app/core/shared/community.model';
import { AuthServiceMock } from 'src/app/shared/mocks/auth.service.mock';
import { hasValue } from '../../shared/empty.util';
import { NotificationType } from '../../shared/notifications/models/notification-type';
import { INotification, Notification } from '../../shared/notifications/models/notification.model';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { createSuccessfulRemoteDataObject, createSuccessfulRemoteDataObject$ } from '../../shared/remote-data.utils';
import { createPaginatedList } from '../../shared/testing/utils.test';
import { CommunityFormComponent } from './community-form.component';

const infoNotification: INotification = new Notification('id', NotificationType.Info, 'info');
const warningNotification: INotification = new Notification('id', NotificationType.Warning, 'warning');
const successNotification: INotification = new Notification('id', NotificationType.Success, 'success');

let notificationsService: NotificationsService;
let formService: DynamicFormService;
let communityService: CommunityDataService;
let communityGroupService: CommunityGroupDataService;
let community: Community;
let selectedCommunityGroup: CommunityGroup;
let communityGroups: CommunityGroup[];
let router: Router;

let comp: CommunityFormComponent;
let fixture: ComponentFixture<CommunityFormComponent>;

describe('CommunityFormComponent', () => {

  beforeEach(() => {
    communityGroups = [
      Object.assign({
        id: '0',
        shortName: 'UM Faculty',
        name: 'Collections Organized by Department',
        _links: {
          self: { href: 'communitygroup1-selflink' },
          communities: { href: 'communitygroup1-communitieslink' }
        }
      }),
      Object.assign({
        id: '2',
        shortName: 'UM Community',
        name: 'UM Community-managed Collections',
        _links: {
          self: { href: 'communitygroup2-selflink' },
          communities: { href: 'communitygroup2-communitieslink' }
        }
      })
    ] as CommunityGroup[];
    selectedCommunityGroup = communityGroups[0];

    formService = Object.assign({
      createFormGroup: (fModel: DynamicFormControlModel[]) => {
        const controls = {};
        if (hasValue(fModel)) {
          fModel.forEach((controlModel) => {
            controls[controlModel.id] = new FormControl((controlModel as any).value);
          });
          return new FormGroup(controls);
        }
        return undefined;
      }
    });

    communityGroupService = jasmine.createSpyObj('communityGroupService', {
      findAll: createSuccessfulRemoteDataObject$(createPaginatedList(communityGroups))
    });

    notificationsService = jasmine.createSpyObj('notificationsService',
      {
        info: infoNotification,
        warning: warningNotification,
        success: successNotification
      }
    );
  });

  describe('CommunityFormComponent with communty group value', () => {

    const requestServiceStub = jasmine.createSpyObj('requestService', {
      removeByHrefSubstring: {}
    });
    const objectCacheStub = jasmine.createSpyObj('objectCache', {
      remove: {}
    });

    beforeEach(waitForAsync(() => {

      community = Object.assign(new Community(), {
        metadata: {
          'dc.description': [
            {
              value: 'Community description'
            }
          ],
          'dc.title': [
            {
              value: 'Community title'
            }
          ]
        },
        communityGroup: createSuccessfulRemoteDataObject$(selectedCommunityGroup),
        _links: {
          self: 'community-selflink',
          communityGroup: 'community-communitygrouplink'
        },
      });
      communityService = jasmine.createSpyObj('communityService', {
        findById: createSuccessfulRemoteDataObject$(community),
        update: createSuccessfulRemoteDataObject$(community),
        updateCommunityGroup: createSuccessfulRemoteDataObject$(community),
        commitUpdates: {},
        patch: {}
      });
      communityGroupService = jasmine.createSpyObj('communityGroupService', {
        findAll: createSuccessfulRemoteDataObject$(createPaginatedList(communityGroups))
      });

      TestBed.configureTestingModule({
        imports: [TranslateModule.forRoot(), RouterTestingModule],
        declarations: [CommunityFormComponent],
        providers: [
          { provide: NotificationsService, useValue: notificationsService },
          { provide: DynamicFormService, useValue: formService },
          { provide: AuthService, useValue: new AuthServiceMock() },
          { provide: RequestService, useValue: requestServiceStub },
          { provide: ObjectCacheService, useValue: objectCacheStub },
          {
            provide: ActivatedRoute,
            useValue: {
              data: observableOf({ community: createSuccessfulRemoteDataObject(community) }),
              snapshot: { queryParams: {} }
            }
          },
          { provide: CommunityDataService, useValue: communityService },
          { provide: CommunityGroupDataService, useValue: communityGroupService },
          ChangeDetectorRef
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();

    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CommunityFormComponent);
      comp = fixture.componentInstance;
      comp.dso = community;
      fixture.detectChanges();
      router = TestBed.inject(Router);
      spyOn(router, 'navigate');
    });

    describe('onSubmit', () => {
      describe('when selected format has not changed', () => {
        beforeEach(() => {
          fixture.detectChanges();
          comp.onSubmit();
        });

        it('should not set updateCommunityGroup', () => {
          expect(comp.updateCommunityGroup).toBeFalse();
        });
      });

      describe('when selected format has changed', () => {
        beforeEach(() => {
          comp.selectedCommunityGroupModel.value = communityGroups[1].id;
          fixture.detectChanges();
          comp.onSubmit();
        });

        it('should set updateCommunityGroup', () => {
          expect(comp.updateCommunityGroup).toBeTruthy();
        });
      });
    });
  });

});
