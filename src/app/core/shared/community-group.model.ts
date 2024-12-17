import {
  autoserialize,
  deserialize,
} from 'cerialize';
import { Observable } from 'rxjs';
import { ResourceType } from 'src/app/core/shared/resource-type';
import { excludeFromEquals } from 'src/app/core/utilities/equals.decorators';

import {
  link,
  typedObject,
} from '../cache/builders/build-decorators';
import { CacheableObject } from '../cache/cacheable-object.model';
import { PaginatedList } from '../data/paginated-list.model';
import { RemoteData } from '../data/remote-data';
import { Community } from './community.model';
import { COMMUNITY } from './community.resource-type';
import { COMMUNITY_GROUP } from './community-group.resource-type';
import { HALLink } from './hal-link.model';

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
