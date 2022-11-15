import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { SharedModule } from '../shared/shared.module';
import { EmbargoListExportCsvComponent } from './embargo-list-export-csv/embargo-list-export-csv.component';
import { EmbargoListPageRoutingModule } from './embargo-list-page-routing.module';
import { EmbargoListPageComponent } from './embargo-list-page.component';
import { EmbargoListComponent } from './embargo-list/embargo-list.component';


@NgModule({
  imports: [
    CommonModule,
    EmbargoListPageRoutingModule,
    NgbModule,
    SharedModule,
    TranslateModule
  ],
  declarations: [
    EmbargoListComponent,
    EmbargoListPageComponent,
    EmbargoListExportCsvComponent,
  ]
})
export class EmbargoListPageModule {
}
