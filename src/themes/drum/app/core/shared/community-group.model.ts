import { autoserialize, deserialize, inheritSerialization } from 'cerialize';
import { Observable } from 'rxjs';
import { ResourceType } from 'src/app/core/shared/resource-type';
import { excludeFromEquals } from 'src/app/core/utilities/equals.decorators';
import { link, typedObject } from '../../../../../app/core/cache/builders/build-decorators';
import { CacheableObject } from '../../../../../app/core/cache/object-cache.reducer';
import { PaginatedList } from '../../../../../app/core/data/paginated-list.model';
import { RemoteData } from '../../../../../app/core/data/remote-data';
import { Community } from '../../../../../app/core/shared/community.model';
import { COMMUNITY } from '../../../../../app/core/shared/community.resource-type';
import { HALLink } from '../../../../../app/core/shared/hal-link.model';
import { COMMUNITY_GROUP } from './community-group.resource-type';

@typedObject
export class CommunityGroup implements CacheableObject {
  static type = COMMUNITY_GROUP;

  /**
   * The object type
   */
  @excludeFromEquals
  @autoserialize
  type: ResourceType = COMMUNITY_GROUP;

  /**
   * The identifier of this CommunityGroup
   */
  @autoserialize
  id: number;

  @autoserialize
  name: string;

  @autoserialize
  shortName: string;

  /**
   * The {@link HALLink}s for this ItemType
   */
  @deserialize
  _links: {
    self: HALLink;
    communities: HALLink;
  };

  /**
   * The list of Communities that belong to this CommunityGroup
   * Will be undefined unless the communities {@link HALLink} has been resolved.
   */
  @link(COMMUNITY, true)
  communities?: Observable<RemoteData<PaginatedList<Community>>>;
}
