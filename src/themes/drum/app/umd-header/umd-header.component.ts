import {Component, OnInit} from '@angular/core';

/**
 * Simple component to inject the standard UMD header banner. Adds a <script>
 * element to the end of the document body to dynamically load the remote script
 * to generate the banner.
 *
 * Based on code at https://stackoverflow.com/a/38473334
 */
@Component({
  selector: 'ds-umd-header',
  template: '',
})
export class UmdHeaderComponent implements OnInit {
  ngOnInit() {
    const url = 'https://umd-header.umd.edu/build/bundle.js?search=0&search_domain=&events=0&news=0&schools=0&admissions=0&support=1&support_url=https%253A%252F%252Fgiving.umd.edu%252Fgiving%252FshowSchool.php%253Fname%253Dlibraries&wrapper=1160&sticky=0';
    // check for an existing #umdheader-main element, so we only add the header once
    if (document.getElementById('umdheader-main') === null) {
      const node = document.createElement('script');
      node.src = url;
      document.body.appendChild(node);
    }
  }
}
