import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { map, switchMap, skipWhile, take } from 'rxjs/operators';
import { isNotEmptyOperator } from '../../../../../app/shared/empty.util';
import { NotificationsService } from '../../../../../app/shared/notifications/notifications.service';
import { RemoteDataBuildService } from '../../../../../app/core/cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../../../../../app/core/cache/object-cache.service';
import { BrowseService } from '../../../../../app/core/browse/browse.service';
import { CoreState } from '../../../../../app/core/core-state.model';
import { Community } from '../../../../../app/core/shared/community.model';
import { COMMUNITY_GROUP } from '../shared/community-group.resource-type';
import { HALEndpointService } from '../../../../../app/core/shared/hal-endpoint.service';
import { PaginatedList } from '../../../../../app/core/data/paginated-list.model';
import { RemoteData } from '../../../../../app/core/data/remote-data';
import { FindListOptions } from '../../../../../app/core/data/find-list-options.model';
import { RequestService } from '../../../../../app/core/data/request.service';
import { FollowLinkConfig } from '../../../../../app/shared/utils/follow-link-config.model';
import { CommunityGroup } from '../shared/community-group.model';
import { DefaultChangeAnalyzer } from '../../../../../app/core/data/default-change-analyzer.service';
import { BaseDataService } from 'src/app/core/data/base/base-data.service';
import { dataService } from 'src/app/core/data/base/data-service.decorator';


@Injectable()
@dataService(COMMUNITY_GROUP)
export class CommunityGroupDataService extends BaseDataService<CommunityGroup> {
  protected linkPath = 'communitygroups';


  private configOnePage: FindListOptions = Object.assign(new FindListOptions(), {
    elementsPerPage: 1
  });

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<CoreState>,
    protected bs: BrowseService,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected comparator: DefaultChangeAnalyzer<CommunityGroup>,
    protected http: HttpClient
  ) {
    super(
      'communitygroups',
      requestService,
      rdbService,
      objectCache,
      halService,
    );
  }

  getItemRequestEndpoint(): Observable<string> {
    return this.halService.getEndpoint(this.linkPath);
  }

  public getTopCommunitiesByGroup(communityGroupID: number, options: FindListOptions = {}, ...linksToFollow: FollowLinkConfig<Community>[]): Observable<RemoteData<PaginatedList<Community>>> {
    const href$ = this.halService.getEndpoint(this.linkPath).pipe(
      switchMap((communityGroupEndpointHref: string) =>
        this.halService.getEndpoint('communities', `${communityGroupEndpointHref}/${communityGroupID}`))
    );
    return this.findAllCommunitiesByHref(href$, options, true, true, ...linksToFollow);
  }

  /**
   * Returns a list of observables of {@link RemoteData} of objects, based on an href, with a list
   * of {@link FollowLinkConfig}, to automatically resolve {@link HALLink}s of the object
   * @param href$                       The url of object we want to retrieve. Can be a string or
   *                                    an Observable<string>
   * @param findListOptions             Find list options object
   * @param useCachedVersionIfAvailable If this is true, the request will only be sent if there's
   *                                    no valid cached version. Defaults to true
   * @param reRequestOnStale            Whether or not the request should automatically be re-
   *                                    requested after the response becomes stale
   * @param linksToFollow               List of {@link FollowLinkConfig} that indicate which
   *                                    {@link HALLink}s should be automatically resolved
   */
  findAllCommunitiesByHref(href$: string | Observable<string>, findListOptions: FindListOptions = {}, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Community>[]): Observable<RemoteData<PaginatedList<Community>>> {
    if (typeof href$ === 'string') {
      href$ = observableOf(href$);
    }

    const requestHref$ = href$.pipe(
      isNotEmptyOperator(),
      take(1),
      map((href: string) => this.buildHrefFromFindOptions(href, findListOptions, []))
    );

    this.createAndSendGetRequest(requestHref$, useCachedVersionIfAvailable);

    return this.rdbService.buildList<Community>(requestHref$, ...linksToFollow).pipe(
      // This skip ensures that if a stale object is present in the cache when you do a
      // call it isn't immediately returned, but we wait until the remote data for the new request
      // is created. If useCachedVersionIfAvailable is false it also ensures you don't get a
      // cached completed object
      skipWhile((rd: RemoteData<PaginatedList<Community>>) => useCachedVersionIfAvailable ? rd.isStale : rd.hasCompleted),
      this.reRequestStaleRemoteData(reRequestOnStale, () =>
        this.findAllCommunitiesByHref(href$, findListOptions, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow))
    );
  }
}
