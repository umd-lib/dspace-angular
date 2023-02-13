import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RestrictedAccessComponent } from './restricted-access.component';

/**
 * Routing module to help navigate Bitstream pages
 */
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: RestrictedAccessComponent,
        data: { title: 'bitstream.restricted-access.title' },
      }
    ])
  ],
})

export class RestrictedAccessPageRoutingModule {
}
