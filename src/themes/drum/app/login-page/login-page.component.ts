import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ThemedLogInComponent } from 'src/app/shared/log-in/themed-log-in.component';

import { LoginPageComponent as BaseComponent } from '../../../../app/login-page/login-page.component';

/**
 * This component represents the login page
 */
@Component({
  selector: 'ds-login-page',
  styleUrls: ['./login-page.component.scss'],
  templateUrl: './login-page.component.html',
  imports: [ThemedLogInComponent, TranslateModule],
  standalone: true,
})
export class LoginPageComponent extends BaseComponent {
}
