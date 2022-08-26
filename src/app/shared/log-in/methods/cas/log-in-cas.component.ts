import { Component, } from '@angular/core';

import { renderAuthMethodFor } from '../log-in.methods-decorator';
import { AuthMethodType } from '../../../../core/auth/models/auth.method-type';
import { LogInExternalProviderComponent } from '../log-in-external-provider.component';

@Component({
  selector: 'ds-log-in-cas',
  templateUrl: './log-in-cas.component.html',
  styleUrls: ['./log-in-cas.component.scss'],

})
@renderAuthMethodFor(AuthMethodType.Cas)
export class LogInCasComponent extends LogInExternalProviderComponent {

  /**
   * Redirect to CAS authentication url
   */
  redirectToCas() {
    this.redirectToExternalProvider();
  }

}
