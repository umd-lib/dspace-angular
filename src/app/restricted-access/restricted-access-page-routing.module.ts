import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BitstreamPageResolver } from '../bitstream-page/bitstream-page.resolver';
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
      },
      {
        path: ':id',
        component: RestrictedAccessComponent,
        data: { title: 'bitstream.restricted-access.title' },
        resolve: {
          bitstream: BitstreamPageResolver
        },
      }
    ])
  ],
  providers: [
    BitstreamPageResolver,
  ]
})

export class RestrictedAccessPageRoutingModule {
}
