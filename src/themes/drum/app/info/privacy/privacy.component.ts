import { Component } from '@angular/core';
import { PrivacyComponent as BaseComponent } from '../../../../../app/info/privacy/privacy.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'ds-privacy',
  styleUrls: ['./privacy.component.scss'],
  templateUrl: './privacy.component.html',
  imports: [TranslateModule],
  standalone: true,
})

/**
 * Component displaying the Privacy Statement
 */
export class PrivacyComponent extends BaseComponent {}
