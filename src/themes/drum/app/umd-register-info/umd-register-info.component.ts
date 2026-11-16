import { Component } from '@angular/core';

import { UmdRegisterInfoContentComponent } from './umd-register-info-content/umd-register-info-content.component';

@Component({
  selector: 'ds-umd-register-info',
  templateUrl: './umd-register-info.component.html',
  styleUrls: ['./umd-register-info.component.scss'],
  imports: [
    UmdRegisterInfoContentComponent,
  ],
})
/**
 * Component displaying the UMD Register Info information
 */
export class UmdRegisterInfoComponent {
}
