import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { combineLatest, map, mergeMap, Observable, take } from 'rxjs';
import { RouteService } from '../core/services/route.service';
import { NativeWindowRef, NativeWindowService } from '../core/services/window.service';
import { HALEndpointService } from '../core/shared/hal-endpoint.service';
import { URLCombiner } from '../core/url-combiner/url-combiner';
import { WufooFeedbackResponse } from './wufoo-feedback-response.model';

/**
 * Retrieves the Wufoo feedback form URL (populated with default form values)
 * from the back-end and and redirects the browser to the Wufoo feedback form.
 */
@Injectable({
  providedIn: 'root'
})
export class WufooFeedbackResolver implements Resolve<any> {
  constructor(
    @Inject(NativeWindowService) protected _window: NativeWindowRef,
    private routeService: RouteService,
    private httpClient: HttpClient,
    private halService: HALEndpointService
  ) {
  }

  /**
   * Retrieves the Wufoo feedback form URL (populated with default form values)
    * from the back-end and and redirects the browser to the Wufoo feedback form.
   */
  resolve(): void {
    let referringUrl$: Observable<string> = this.routeService.getCurrentUrl().pipe(
      take(1),
      map((urlPath: string): string => { return (urlPath ? urlPath : '/'); }),
      map((urlPath: string): string => {
        return new URLCombiner(this._window.nativeWindow.origin, urlPath).toString();
      })
    );

    let wufooFeedbackEndpoint$: Observable<string> = this.halService.getEndpoint('wufoo-feedback');

    let wufooFeedbackResponse$ = combineLatest([referringUrl$, wufooFeedbackEndpoint$]).pipe(
      mergeMap(([referringPageUrl, wufooFeedbackUrl]): Observable<any> => {
        return this.httpClient.get(wufooFeedbackUrl, { params: { 'page': referringPageUrl } });
      })
    );

    wufooFeedbackResponse$.subscribe((obj) => {
      let wufooFeedbackResponse = <WufooFeedbackResponse> <unknown> obj;
      let redirectUrl = wufooFeedbackResponse.wufooFeedbackFormUrl;

      if (redirectUrl) {
        // If we have a redirectUrl, send the browser to it.
        window.location.href = redirectUrl;
      }
    });
  }
}
