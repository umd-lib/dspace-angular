import { Route } from '@angular/router';

import { i18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';
import { siteAdministratorGuard } from '../core/data/feature-authorization/feature-authorization-guard/site-administrator.guard';
import { EmbargoListPageComponent } from './embargo-list-page.component';

export const ROUTES: Route[] = [
  {
    path: '',
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: {
      breadcrumbKey: 'embargo-list',
      title: 'embargo-list.title',
    },
    component: EmbargoListPageComponent,
    canActivate: [siteAdministratorGuard],
  },
];
