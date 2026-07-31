import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'ds-umd-about-content',
  templateUrl: './umd-about-content.component.html',
  styleUrls: ['./umd-about-content.component.scss'],
  standalone: true,
  imports: [RouterLink, TranslateModule],
})
/**
 * Component displaying the contents of the UMD About information
 */
export class UmdAboutContentComponent {
}
