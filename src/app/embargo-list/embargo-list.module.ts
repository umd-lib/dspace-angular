import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../shared/shared.module';
import { EmbargoListExportCsvComponent } from './embargo-list-export-csv/embargo-list-export-csv.component';
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
    EmbargoListExportCsvComponent,
  ]
})
export class EmbargoListModule {
}
