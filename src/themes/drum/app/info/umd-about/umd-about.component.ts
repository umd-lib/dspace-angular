import { Component } from '@angular/core';

import { UmdAboutContentComponent } from './umd-about-content/umd-about-content.component';

@Component({
  selector: 'ds-umd-about',
  templateUrl: './umd-about.component.html',
  styleUrls: ['./umd-about.component.scss'],
  standalone: true,
  imports: [UmdAboutContentComponent],
})
/**
 * Component displaying the UMD About information
 */
export class UmdAboutComponent {
}
