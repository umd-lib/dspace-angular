import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EMBARGO_LIST_PATH } from '../app-routing-paths';
import { EmbargoListComponent } from './embargo-list.component';
import { SiteAdministratorGuard } from '../core/data/feature-authorization/feature-authorization-guard/site-administrator.guard';
import { I18nBreadcrumbResolver } from '../core/breadcrumbs/i18n-breadcrumb.resolver';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        resolve: { breadcrumb: I18nBreadcrumbResolver },
        data: {
          breadcrumbKey: 'embargo-list',
          title: 'embargo-list.title',
        },
        component: EmbargoListComponent,
        canActivate: [SiteAdministratorGuard]
      },
    ])
  ],
})
export class EmbargoListRoutingModule {
}
