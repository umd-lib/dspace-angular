import { DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';
import { RestrictedAccessPageRoutingModule } from './restricted-access-page-routing.module';
import { RestrictedAccessComponent } from './restricted-access.component';

@NgModule({
  imports: [
    RestrictedAccessPageRoutingModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [
    RestrictedAccessComponent,
  ],
  providers: [
    DatePipe,
  ]
})

export class RestrictedAccessPageModule {
}
