import { Component } from '@angular/core';
import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'ds-footer',
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
