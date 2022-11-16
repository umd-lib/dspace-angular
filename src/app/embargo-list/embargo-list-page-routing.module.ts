import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { EmbargoListPageComponent } from './embargo-list-page.component';
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
        component: EmbargoListPageComponent,
        canActivate: [SiteAdministratorGuard]
      },
    ])
  ],
})

export class EmbargoListPageRoutingModule {
}
