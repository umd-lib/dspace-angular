import { HttpHeaders } from '@angular/common/http'; // UMD Customization for LIBDRUM-701
import { Injectable } from '@angular/core';
import { combineLatest as observableCombineLatest, Observable } from 'rxjs'; // UMD Customization for LIBDRUM-701
import { filter, map, switchMap, take } from 'rxjs/operators';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { Community } from '../shared/community.model';
import { COMMUNITY } from '../shared/community.resource-type';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { ComColDataService } from './comcol-data.service';
import { DSOChangeAnalyzer } from './dso-change-analyzer.service';
import { PaginatedList } from './paginated-list.model';
import { RemoteData } from './remote-data';
import { RequestService } from './request.service';
import { BitstreamDataService } from './bitstream-data.service';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { isNotEmpty } from '../../shared/empty.util';
import { FindListOptions } from './find-list-options.model';
import { dataService } from './base/data-service.decorator';
// UMD Customization for LIBDRUM-701
import { CommunityGroup } from '../shared/community-group.model';
import { CommunityGroupDataService } from './community-group-data.service';
import { HttpOptions } from '../dspace-rest/dspace-rest.service';
import { PutRequest } from './request.models';
import { sendRequest } from '../shared/request.operators';
// End UMD Customization for LIBDRUM-701

@Injectable()
@dataService(COMMUNITY)
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
    protected cgService: CommunityGroupDataService, // UMD Customization for LIBDRUM-701
  ) {
    super('communities', requestService, rdbService, objectCache, halService, comparator, notificationsService, bitstreamDataService);
  }

  // this method is overridden in order to make it public
  getEndpoint() {
    return this.halService.getEndpoint(this.linkPath);
  }

  findTop(options: FindListOptions = {}, ...linksToFollow: FollowLinkConfig<Community>[]): Observable<RemoteData<PaginatedList<Community>>> {
    return this.getEndpoint().pipe(
      map(href => `${href}/search/top`),
      switchMap(href => this.findListByHref(href, options, true, true, ...linksToFollow))
    );
  }

  protected getFindByParentHref(parentUUID: string): Observable<string> {
    return this.halService.getEndpoint(this.linkPath).pipe(
      switchMap((communityEndpointHref: string) =>
        this.halService.getEndpoint('subcommunities', `${communityEndpointHref}/${parentUUID}`))
    );
  }

  protected getScopeCommunityHref(options: FindListOptions) {
    return this.getEndpoint().pipe(
      map((endpoint: string) => this.getIDHref(endpoint, options.scopeID)),
      filter((href: string) => isNotEmpty(href)),
      take(1)
    );
  }

  // UMD Customization for LIBDRUM-701
  /**
   * Set the community group of a community
   * @param community
   * @param community group
   */
  updateCommunityGroup(community: Community, cg: CommunityGroup): Observable<RemoteData<Community>> {
    const requestId = this.requestService.generateRequestId();
    const communityHref$ = this.getBrowseEndpoint().pipe(
      map((href: string) => `${href}/${community.id}`),
      switchMap((href: string) => this.halService.getEndpoint('communityGroup', href))
    );
    const cgHref$ = this.cgService.getBrowseEndpoint().pipe(
      map((href: string) => `${href}/${cg.id}`)
    );
    observableCombineLatest([communityHref$, cgHref$]).pipe(
      map(([communityHref, cgHref]) => {
        const options: HttpOptions = Object.create({});
        let headers = new HttpHeaders();
        headers = headers.append('Content-Type', 'text/uri-list');
        options.headers = headers;
        return new PutRequest(requestId, communityHref, cgHref
          , options);
      }),
      sendRequest(this.requestService),
      take(1)
    ).subscribe(() => {
      this.requestService.removeByHrefSubstring(community.self + '/communityGroup');
    });

    return this.rdbService.buildFromRequestUUID(requestId);
  }
  // End UMD Customization for LIBDRUM-701
}
