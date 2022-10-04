import { Observable } from 'rxjs';
import { RemoteData } from 'src/app/core/data/remote-data';
import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { Ldap } from 'src/app/core/eperson/models/ldap.model';
import { NoContent } from 'src/app/core/shared/NoContent.model';
import { createNoContentRemoteDataObject$ } from '../remote-data.utils';
import { FollowLinkConfig } from '../utils/follow-link-config.model';

/**
 * Stub for LdapDataService
 */
export class LdapDataServiceStub {
  /**
   * Always returns no content
   */
  public getLdap(
      eperson: EPerson,
      useCachedVersionIfAvailable = true,
      reRequestOnStale = true, ...linksToFollow:
      FollowLinkConfig<Ldap>[]): Observable<RemoteData<Ldap | NoContent>> {
    return createNoContentRemoteDataObject$();
  }
}
