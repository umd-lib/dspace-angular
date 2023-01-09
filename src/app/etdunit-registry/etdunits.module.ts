import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { I18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { SiteAdministratorGuard } from '../core/data/feature-authorization/feature-authorization-guard/site-administrator.guard';
import { FormModule } from '../shared/form/form.module';

import { SharedModule } from '../shared/shared.module';
import { EtdUnitCollectionsListComponent } from './etdunit-form/etdunit-collection-list/etdunit-collections-list.component';
import { EtdUnitFormComponent } from './etdunit-form/etdunit-form.component';
import { EtdUnitsRegistryComponent } from './etdunits-registry.component';

const routes: Routes = [
  {
    path: '',
    component: EtdUnitsRegistryComponent,
    resolve: {
      breadcrumb: I18nBreadcrumbResolver
    },
    data: { title: 'admin.core.etdunits.title', breadcrumbKey: 'admin.core.etdunits' },
    canActivate: [SiteAdministratorGuard]
  },
  {
    path: 'newEtdUnit',
    component: EtdUnitFormComponent,
    resolve: {
      breadcrumb: I18nBreadcrumbResolver
    },
    data: { title: 'admin.core.etdunits.title.addEtdUnit', breadcrumbKey: 'admin.core.etdunits.addEtdUnit' },
    canActivate: [SiteAdministratorGuard]
  },
  {
    path: ':etdunitId',
    component: EtdUnitFormComponent,
    resolve: {
      breadcrumb: I18nBreadcrumbResolver
    },
    data: { title: 'admin.core.etdunits.title.singleEtdUnit', breadcrumbKey: 'admin.core.etdunits.singleEtdUnit' },
    canActivate: [SiteAdministratorGuard]
  },
];

/**
 * Page for displaying ETD Departments list
 */
@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    RouterModule.forChild(routes),
    SharedModule,
    TranslateModule,
    FormModule
  ],
  exports: [RouterModule],
  declarations: [
    EtdUnitsRegistryComponent,
    EtdUnitFormComponent,
    EtdUnitCollectionsListComponent
  ]
})
export class EtdUnitsModule {
}
