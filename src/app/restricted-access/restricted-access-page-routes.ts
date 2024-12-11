import { Route } from '@angular/router';
import { bitstreamPageResolver } from '../bitstream-page/bitstream-page.resolver';
import { RestrictedAccessComponent } from './restricted-access.component';

export const ROUTES: Route[] = [
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
          bitstream: bitstreamPageResolver
        },
      }
];
