import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormModule } from '../shared/form/form.module';

import { SharedModule } from '../shared/shared.module';
import { EtdUnitFormComponent } from './etdunit-form/etdunit-form.component';
import { EtdUnitsRegistryComponent } from './etdunits-registry.component';


/**
 * Page for displaying embargo list and CSV export button.
 */
@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    SharedModule,
    TranslateModule,
    FormModule
  ],
  declarations: [
    EtdUnitsRegistryComponent,
    EtdUnitFormComponent
  ]
})
export class EtdUnitsModule {
}
