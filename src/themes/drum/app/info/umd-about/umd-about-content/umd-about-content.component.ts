import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';

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
export class UmdAboutContentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // Skip if using server-side rendering (SSR), because "document" and
    // "requestAnimationFrame" are not available
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Following is used to ensure that the "About DRUM: Accessibility" link
    // in the footer properly scrolls to the "accessibility" anchor in the HTML.
    // Uses a nested requestAnimationFrame to defer scrolling until after
    // Angular Router's own scroll-restoration logic (scrollPositionRestoration:
    // 'top') has run and completed; otherwise the router resets the scroll
    // position to the top immediately after this scrolls to the anchor.
    this.route.fragment
      .pipe(take(1))
      .subscribe(fragment => {
        if (!fragment) {
          return;
        }
        const scroll = () => {
          const el = document.getElementById(fragment);
          if (el) {
            el.scrollIntoView({ block: 'start' });
          }
        };
        requestAnimationFrame(() => requestAnimationFrame(scroll));
      });
  }
}
