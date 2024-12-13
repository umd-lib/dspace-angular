import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { LogInExternalProviderComponent } from '../log-in-external-provider/log-in-external-provider.component';

@Component({
  selector: 'ds-log-in-cas',
  templateUrl: './log-in-cas.component.html',
  styleUrls: ['./log-in-cas.component.scss'],
  imports: [TranslateModule],
  standalone: true,
})
export class LogInCasComponent extends LogInExternalProviderComponent {

  /**
   * Redirect to CAS authentication url
   */
  redirectToCas() {
    this.redirectToExternalProvider();
  }

}
