import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { getForgotPasswordRoute } from 'src/app/app-routing-paths';

@Component({
  selector: 'ds-umd-register-info-content',
  templateUrl: './umd-register-info-content.component.html',
  styleUrls: ['./umd-register-info-content.component.scss'],
  imports: [
    RouterLink,
    TranslateModule,
  ],
})
/**
 * Component displaying the contents of the UMD Register Info information
 */
export class UmdRegisterInfoContentComponent {
  protected readonly forgotPasswordRoute = getForgotPasswordRoute();
}
