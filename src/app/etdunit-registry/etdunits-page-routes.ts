import { Route } from '@angular/router';

import { siteAdministratorGuard } from '../core/data/feature-authorization/feature-authorization-guard/site-administrator.guard';
import { i18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { EtdUnitsRegistryComponent } from './etdunits-registry.component';
import { EtdUnitFormComponent } from './etdunit-form/etdunit-form.component';

export const ROUTES: Route[] = [
    {
      path: '',
      component: EtdUnitsRegistryComponent,
      resolve: {
        breadcrumb: i18nBreadcrumbResolver
      },
      data: { title: 'admin.core.etdunits.title', breadcrumbKey: 'admin.core.etdunits' },
      canActivate: [siteAdministratorGuard]
    },
    {
      path: 'newEtdUnit',
      component: EtdUnitFormComponent,
      resolve: {
        breadcrumb: i18nBreadcrumbResolver
      },
      data: { title: 'admin.core.etdunits.title.addEtdUnit', breadcrumbKey: 'admin.core.etdunits.addEtdUnit' },
      canActivate: [siteAdministratorGuard]
    },
    {
      path: ':etdunitId',
      component: EtdUnitFormComponent,
      resolve: {
        breadcrumb: i18nBreadcrumbResolver
      },
      data: { title: 'admin.core.etdunits.title.singleEtdUnit', breadcrumbKey: 'admin.core.etdunits.singleEtdUnit' },
      canActivate: [siteAdministratorGuard]
    },
  ];
  