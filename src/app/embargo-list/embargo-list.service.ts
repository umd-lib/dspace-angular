import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  map,
  switchMap,
} from 'rxjs/operators';

import { DspaceRestService } from '../core/dspace-rest/dspace-rest.service';
import { HALEndpointService } from '../core/shared/hal-endpoint.service';
import { EmbargoListEntry } from './models/embargo-list-entry.model';

@Injectable({
  providedIn: 'root',
})
export class EmbargoListService {
  constructor(protected halService: HALEndpointService,
              protected restService: DspaceRestService) {
  }

  /**
   * Returns an Observable from the embargo list REST endpoint.
   * @returns embargo list data
   */
  getEmbargoList(): Observable<EmbargoListEntry[]> {
    return this.halService.getEndpoint('/embargo-list').pipe(
      switchMap((endpoint: string) => this.restService.get(endpoint)),
      map((response) =>
        response.payload as unknown as EmbargoListEntry[],
      ),
    );
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
