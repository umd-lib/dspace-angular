// UMD Customization
/* eslint-disable import-newlines/enforce */
/* eslint-disable simple-import-sort/imports */
// End Customization
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  filter,
  map,
  switchMap,
  take,
} from 'rxjs/operators';

import { isNotEmpty } from '../../shared/empty.util';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { Community } from '../shared/community.model';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { BitstreamDataService } from './bitstream-data.service';
import { ComColDataService } from './comcol-data.service';
import { DSOChangeAnalyzer } from './dso-change-analyzer.service';
import { FindListOptions } from './find-list-options.model';
import { PaginatedList } from './paginated-list.model';
import { RemoteData } from './remote-data';
import { RequestService } from './request.service';
// UMD Customization
import { CommunityGroupDataService } from './community-group-data.service';
// End UMD Customization

@Injectable({ providedIn: 'root' })
export class CommunityDataService extends ComColDataService<Community> {
  protected topLinkPath = 'search/top';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected comparator: DSOChangeAnalyzer<Community>,
    protected notificationsService: NotificationsService,
    protected bitstreamDataService: BitstreamDataService,
    // UMD Customization
    protected cgService?: CommunityGroupDataService,
    // End UMD Customization
  ) {
    // UMD Customization
    super('communities', requestService, rdbService, objectCache, halService, comparator, notificationsService, bitstreamDataService, cgService);
    // End UMD Customization
  }

  // this method is overridden in order to make it public
  getEndpoint() {
    return this.halService.getEndpoint(this.linkPath);
  }

  findTop(options: FindListOptions = {}, ...linksToFollow: FollowLinkConfig<Community>[]): Observable<RemoteData<PaginatedList<Community>>> {
    return this.getEndpoint().pipe(
      map(href => `${href}/search/top`),
      switchMap(href => this.findListByHref(href, options, true, true, ...linksToFollow)),
    );
  }

  protected getFindByParentHref(parentUUID: string): Observable<string> {
    return this.halService.getEndpoint(this.linkPath).pipe(
      switchMap((communityEndpointHref: string) =>
        this.halService.getEndpoint('subcommunities', `${communityEndpointHref}/${parentUUID}`)),
    );
  }

  protected getScopeCommunityHref(options: FindListOptions) {
    return this.getEndpoint().pipe(
      map((endpoint: string) => this.getIDHref(endpoint, options.scopeID)),
      filter((href: string) => isNotEmpty(href)),
      take(1),
    );
  }
}
