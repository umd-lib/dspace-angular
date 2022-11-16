import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DspaceRestService } from '../core/dspace-rest/dspace-rest.service';
import { RawRestResponse } from '../core/dspace-rest/raw-rest-response.model';
import { HALEndpointService } from '../core/shared/hal-endpoint.service';

@Injectable({
    providedIn: 'root'
})
export class EmbargoListService {
  constructor(protected halService: HALEndpointService,
              protected restService: DspaceRestService) {
  }

  /**
   * Returns an Observable from the embargo list REST endpoint.
   * @returns embargo list data
   */
  getEmbargoList(): Observable<RawRestResponse> {
     return this.halService.getEndpoint('/embargo-list').pipe(
       switchMap((endpoint: string) => this.restService.get(endpoint)));
  }

  /**
   * Returns the local URL path to the given handle
   *
   * @returns the local URL path to the given handle
   */
  getHandleLink(handle: string): string {
    return `/handle/${handle}`;
  }
}
