import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';

@Component({
  selector: 'ds-themed-footer',
  styleUrls: ['footer.component.scss'],
  templateUrl: 'footer.component.html',
  imports: [NgIf, RouterLink, TranslateModule],
  standalone: true,
})
export class FooterComponent extends BaseComponent {
  /**
   * A boolean representing if to show or not the top footer container
   */
  showTopFooter = true;
}
