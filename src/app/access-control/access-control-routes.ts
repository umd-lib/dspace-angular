import { AbstractControl } from '@angular/forms';
import { Route } from '@angular/router';
import {
  DYNAMIC_ERROR_MESSAGES_MATCHER,
  DynamicErrorMessagesMatcher,
} from '@ng-dynamic-forms/core';

import { i18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { groupAdministratorGuard } from '../core/data/feature-authorization/feature-authorization-guard/group-administrator.guard';
import { siteAdministratorGuard } from '../core/data/feature-authorization/feature-authorization-guard/site-administrator.guard';
import {
  EPERSON_PATH,
  GROUP_PATH,
} from './access-control-routing-paths';
import { BulkAccessComponent } from './bulk-access/bulk-access.component';
import { EPeopleRegistryComponent } from './epeople-registry/epeople-registry.component';
import { EPersonFormComponent } from './epeople-registry/eperson-form/eperson-form.component';
import { EPersonResolver } from './epeople-registry/eperson-resolver.service';
import { GroupFormComponent } from './group-registry/group-form/group-form.component';
import { groupPageGuard } from './group-registry/group-page.guard';
import { GroupsRegistryComponent } from './group-registry/groups-registry.component';
// UMD Customization
import { UNIT_EDIT_PATH } from './access-control-routing-paths';
import { UnitsRegistryComponent } from './unit-registry/units-registry.component';
import { UnitFormComponent } from './unit-registry/unit-form/unit-form.component';
// End UMD Customization

/**
 * Condition for displaying error messages on email form field
 */
export const ValidateEmailErrorStateMatcher: DynamicErrorMessagesMatcher =
  (control: AbstractControl, model: any, hasFocus: boolean) => {
    return ( control.touched && !hasFocus ) || ( control.errors?.emailTaken && hasFocus );
  };

const providers = [
  {
    provide: DYNAMIC_ERROR_MESSAGES_MATCHER,
    useValue: ValidateEmailErrorStateMatcher,
  },
];
export const ROUTES: Route[] = [
  {
    path: EPERSON_PATH,
    component: EPeopleRegistryComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
    },
    providers,
    data: { title: 'admin.access-control.epeople.title', breadcrumbKey: 'admin.access-control.epeople' },
    canActivate: [siteAdministratorGuard],
  },
  {
    path: `${EPERSON_PATH}/create`,
    component: EPersonFormComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
    },
    providers,
    data: { title: 'admin.access-control.epeople.add.title', breadcrumbKey: 'admin.access-control.epeople.add' },
    canActivate: [siteAdministratorGuard],
  },
  {
    path: `${EPERSON_PATH}/:id/edit`,
    component: EPersonFormComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
      ePerson: EPersonResolver,
    },
    providers,
    data: { title: 'admin.access-control.epeople.edit.title', breadcrumbKey: 'admin.access-control.epeople.edit' },
    canActivate: [siteAdministratorGuard],
  },
  {
    path: GROUP_PATH,
    component: GroupsRegistryComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
    },
    providers,
    data: { title: 'admin.access-control.groups.title', breadcrumbKey: 'admin.access-control.groups' },
    canActivate: [groupAdministratorGuard],
  },
  {
    path: `${GROUP_PATH}/create`,
    component: GroupFormComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
    },
    providers,
    data: {
      title: 'admin.access-control.groups.title.addGroup',
      breadcrumbKey: 'admin.access-control.groups.addGroup',
    },
    canActivate: [groupAdministratorGuard],
  },
  {
    path: `${GROUP_PATH}/:groupId/edit`,
    component: GroupFormComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
    },
    providers,
    data: {
      title: 'admin.access-control.groups.title.singleGroup',
      breadcrumbKey: 'admin.access-control.groups.singleGroup',
    },
    canActivate: [groupPageGuard],
  },
  {
    path: 'bulk-access',
    component: BulkAccessComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
    },
    data: { title: 'admin.access-control.bulk-access.title', breadcrumbKey: 'admin.access-control.bulk-access' },
    canActivate: [siteAdministratorGuard],
  },
  // UMD Customization
  {
    path: UNIT_EDIT_PATH,
    component: UnitsRegistryComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbResolver
    },
    data: { title: 'admin.access-control.units.title', breadcrumbKey: 'admin.access-control.units' },
    canActivate: [siteAdministratorGuard]
  },
  {
    path: `${UNIT_EDIT_PATH}/newUnit`,
    component: UnitFormComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbResolver
    },
    data: { title: 'admin.access-control.units.title.addUnit', breadcrumbKey: 'admin.access-control.units.addUnit' },
    canActivate: [siteAdministratorGuard]
  },
  {
    path: `${UNIT_EDIT_PATH}/:unitId`,
    component: UnitFormComponent,
    resolve: {
      breadcrumb: i18nBreadcrumbResolver
    },
    data: { title: 'admin.access-control.units.title.singleUnit', breadcrumbKey: 'admin.access-control.units.singleUnit' },
    canActivate: [siteAdministratorGuard]
  }
  // End UMD Customization

];
