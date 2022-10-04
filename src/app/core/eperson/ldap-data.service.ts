import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { dataService } from '../cache/builders/build-decorators';
import { RemoteDataBuildService } from '../cache/builders/remote-data-build.service';
import { ObjectCacheService } from '../cache/object-cache.service';
import { DataService } from '../data/data.service';
import { DSOChangeAnalyzer } from '../data/dso-change-analyzer.service';
import { RemoteData } from '../data/remote-data';
import { RequestService } from '../data/request.service';
import { HALEndpointService } from '../shared/hal-endpoint.service';
import { Ldap } from './models/ldap.model';
import { LDAP } from './models/ldap.resource-type';
import { NoContent } from '../shared/NoContent.model';
import { EPerson } from './models/eperson.model';

/**
 * A service to retrieve {@link Ldap} information from the REST API
 */
@Injectable()
@dataService(LDAP)
export class LdapDataService extends DataService<Ldap> {

  protected linkPath = 'ldap';

  constructor(
    protected requestService: RequestService,
    protected rdbService: RemoteDataBuildService,
    protected store: Store<any>,
    protected objectCache: ObjectCacheService,
    protected halService: HALEndpointService,
    protected notificationsService: NotificationsService,
    protected http: HttpClient,
    protected comparator: DSOChangeAnalyzer<Ldap>
  ) {
    super();
  }

  public getLdap(eperson: EPerson, useCachedVersionIfAvailable = true, reRequestOnStale = true, ...linksToFollow: FollowLinkConfig<Ldap>[]): Observable<RemoteData<Ldap | NoContent>> {
    return this.findByHref(eperson._links.ldap.href, useCachedVersionIfAvailable, reRequestOnStale, ...linksToFollow);
  }
}
