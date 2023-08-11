import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { Angulartics2Matomo } from 'angulartics2';
import { combineLatest } from 'rxjs';

import { ConfigurationDataService } from '../core/data/configuration-data.service';
import { getFirstCompletedRemoteData } from '../core/shared/operators';
import { isEmpty } from '../shared/empty.util';
import { KlaroService } from '../shared/cookies/klaro.service';
import { GOOGLE_ANALYTICS_KLARO_KEY } from '../shared/cookies/klaro-configuration';

/**
 * Set up Matomo Analytics on the client side.
 * See: {@link addTrackingIdToPage}.
 */
@Injectable()
export class MatomoAnalyticsService {

  constructor(
    private matomoAnalytics: Angulartics2Matomo,
    // private klaroService: KlaroService,
    private configService: ConfigurationDataService,
    @Inject(DOCUMENT) private document: any,
  ) {
  }

  /**
   * Call this method once when Angular initializes on the client side.
   * It requests the Matomo tracking propertiesfrom the rest backend
   * adds the tracking snippet to the page and starts tracking.
   */
  addTrackingIdToPage(): void {
    const matomo_url_rd$ = this.configService.findByPropertyName('matomo.analytics.url').pipe(
        getFirstCompletedRemoteData(),
    );
    const matomo_site_id_rd$ = this.configService.findByPropertyName('matomo.analytics.site-id').pipe(
      getFirstCompletedRemoteData(),
    );
    const matomo_cdn_src_rd$ = this.configService.findByPropertyName('matomo.analytics.cdn-src').pipe(
      getFirstCompletedRemoteData(),
    );

    combineLatest([matomo_url_rd$, matomo_site_id_rd$, matomo_cdn_src_rd$])
      .subscribe(([matomo_url_rd, matomo_site_id_rd, matomo_cdn_src_rd]) => {

        // make sure we got a success response from the backend
        if (matomo_url_rd.hasFailed || matomo_site_id_rd.hasFailed || matomo_cdn_src_rd.hasFailed) {
          return;
        }

        const matomo_url = matomo_url_rd.payload.values[0];
        const  matomo_site_id =  matomo_site_id_rd.payload.values[0];
        const matomo_cdn_src = matomo_cdn_src_rd.payload.values[0];

        // Make sure we have valid values for all the properties
        if (isEmpty(matomo_url) || isEmpty(matomo_site_id) || isEmpty(matomo_cdn_src)) {
          return;
        }

        // add Matomo tracking snippet to page
        const keyScript = this.document.createElement('script');
        keyScript.innerHTML =
          `
          var _paq = window._paq = window._paq || [];
          /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);
          (function() {
            var u="${matomo_url}";
            _paq.push(['setTrackerUrl', u+'matomo.php']);
            _paq.push(['setSiteId', '${matomo_site_id}']);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src='${matomo_cdn_src}'; s.parentNode.insertBefore(g,s);
          })();
          `;
          this.document.head.appendChild(keyScript);

          // start tracking
          this.matomoAnalytics.startTracking();
      });
  }
}
