import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PrivacyComponent as BaseComponent } from '../../../../../app/info/privacy/privacy.component';

@Component({
  selector: 'ds-themed-privacy',
  styleUrls: ['./privacy.component.scss'],
  templateUrl: './privacy.component.html',
  imports: [TranslateModule],
  standalone: true,
})

/**
 * Component displaying the Privacy Statement
 */
export class PrivacyComponent extends BaseComponent {}
