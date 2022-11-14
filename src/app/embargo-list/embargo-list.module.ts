import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../shared/shared.module';
import { EmbargoListRoutingModule } from './embargo-list-routing.module';
import { EmbargoListComponent } from './embargo-list.component';


@NgModule({
  imports: [
    CommonModule,
    EmbargoListRoutingModule,
    NgbModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [
    EmbargoListComponent,
  ]
})
export class EmbargoListModule {
}
