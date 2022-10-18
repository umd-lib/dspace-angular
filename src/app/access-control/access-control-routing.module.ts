import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EPeopleRegistryComponent } from './epeople-registry/epeople-registry.component';
import { GroupFormComponent } from './group-registry/group-form/group-form.component';
import { GroupsRegistryComponent } from './group-registry/groups-registry.component';
import { GROUP_EDIT_PATH } from './access-control-routing-paths';
import { I18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { GroupPageGuard } from './group-registry/group-page.guard';
import { GroupAdministratorGuard } from '../core/data/feature-authorization/feature-authorization-guard/group-administrator.guard';
import { SiteAdministratorGuard } from '../core/data/feature-authorization/feature-authorization-guard/site-administrator.guard';
// UMD Customization
import { UNIT_EDIT_PATH } from './access-control-routing-paths';
import { UnitsRegistryComponent } from './unit-registry/units-registry.component';
import { UnitFormComponent } from './unit-registry/unit-form/unit-form.component';
// End UMD Customization

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'epeople',
        component: EPeopleRegistryComponent,
        resolve: {
          breadcrumb: I18nBreadcrumbResolver
        },
        data: { title: 'admin.access-control.epeople.title', breadcrumbKey: 'admin.access-control.epeople' },
        canActivate: [SiteAdministratorGuard]
      },
      {
        path: GROUP_EDIT_PATH,
        component: GroupsRegistryComponent,
        resolve: {
          breadcrumb: I18nBreadcrumbResolver
        },
        data: { title: 'admin.access-control.groups.title', breadcrumbKey: 'admin.access-control.groups' },
        canActivate: [GroupAdministratorGuard]
      },
      {
        path: `${GROUP_EDIT_PATH}/newGroup`,
        component: GroupFormComponent,
        resolve: {
          breadcrumb: I18nBreadcrumbResolver
        },
        data: { title: 'admin.access-control.groups.title.addGroup', breadcrumbKey: 'admin.access-control.groups.addGroup' },
        canActivate: [GroupAdministratorGuard]
      },
      {
        path: `${GROUP_EDIT_PATH}/:groupId`,
        component: GroupFormComponent,
        resolve: {
          breadcrumb: I18nBreadcrumbResolver
        },
        data: { title: 'admin.access-control.groups.title.singleGroup', breadcrumbKey: 'admin.access-control.groups.singleGroup' },
        canActivate: [GroupPageGuard]
      },
      // UMD Customization
      {
        path: UNIT_EDIT_PATH,
        component: UnitsRegistryComponent,
        resolve: {
          breadcrumb: I18nBreadcrumbResolver
        },
        data: { title: 'admin.access-control.units.title', breadcrumbKey: 'admin.access-control.units' },
        canActivate: [SiteAdministratorGuard]
      },
      // {
      //   path: `${UNIT_EDIT_PATH}/newUnit`,
      //   component: UnitFormComponent,
      //   resolve: {
      //     breadcrumb: I18nBreadcrumbResolver
      //   },
      //   data: { title: 'admin.access-control.units.title.addUnit', breadcrumbKey: 'admin.access-control.units.addUnit' },
      //   canActivate: [SiteAdministratorGuard]
      // },
      {
        path: `${UNIT_EDIT_PATH}/:unitId`,
        component: UnitFormComponent,
        resolve: {
          breadcrumb: I18nBreadcrumbResolver
        },
        data: { title: 'admin.access-control.units.title.singleUnit', breadcrumbKey: 'admin.access-control.units.singleUnit' },
        canActivate: [SiteAdministratorGuard]
      }
      // End UMD Customization
    ])
  ]
})
/**
 * Routing module for the AccessControl section of the admin sidebar
 */
export class AccessControlRoutingModule {

}
