import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
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
     * @returns embargo list data
     */
    getEmbargoList(): Observable<RawRestResponse> {
       return this.halService.getEndpoint('/embargo-list').pipe(
         switchMap((endpoint: string) => this.restService.get(endpoint)));
    }
}
