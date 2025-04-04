// UMD Customization
/* eslint-disable import-newlines/enforce */
/* eslint-disable simple-import-sort/imports */
// End Customization
import {
  autoserialize,
  deserialize,
  inheritSerialization,
} from 'cerialize';
import { Observable } from 'rxjs';

import {
  link,
  typedObject,
} from '../cache/builders/build-decorators';
import { PaginatedList } from '../data/paginated-list.model';
import { RemoteData } from '../data/remote-data';
import { excludeFromEquals } from '../utilities/equals.decorators';
import { Bitstream } from './bitstream.model';
import { BITSTREAM } from './bitstream.resource-type';
import { ChildHALResource } from './child-hal-resource.model';
import { Collection } from './collection.model';
import { COLLECTION } from './collection.resource-type';
import { COMMUNITY } from './community.resource-type';
import { DSpaceObject } from './dspace-object.model';
import { HALLink } from './hal-link.model';
import { HandleObject } from './handle-object.model';
// UMD Customization
import { COMMUNITY_GROUP } from './community-group.resource-type';
import { CommunityGroup } from './community-group.model';
// End UMD Customization

@typedObject
@inheritSerialization(DSpaceObject)
export class Community extends DSpaceObject implements ChildHALResource, HandleObject {
  static type = COMMUNITY;

  @excludeFromEquals
  @autoserialize
  archivedItemsCount: number;

  /**
   * The {@link HALLink}s for this Community
   */
  @deserialize
  _links: {
    collections: HALLink;
    logo: HALLink;
    subcommunities: HALLink;
    parentCommunity: HALLink;
    // UMD Customization
    communityGroup: HALLink;
    // End UMD Customization
    adminGroup: HALLink;
    self: HALLink;
  };

  /**
   * The logo for this Community
   * Will be undefined unless the logo {@link HALLink} has been resolved.
   */
  @link(BITSTREAM)
  logo?: Observable<RemoteData<Bitstream>>;

  /**
   * The list of Collections that are direct children of this Community
   * Will be undefined unless the collections {@link HALLink} has been resolved.
   */
  @link(COLLECTION, true)
  collections?: Observable<RemoteData<PaginatedList<Collection>>>;

  /**
   * The list of Communities that are direct children of this Community
   * Will be undefined unless the subcommunities {@link HALLink} has been resolved.
   */
  @link(COMMUNITY, true)
  subcommunities?: Observable<RemoteData<PaginatedList<Community>>>;

  /**
   * The Community that is a direct parent of this Community
   * Will be undefined unless the parent community HALLink has been resolved.
   */
  @link(COMMUNITY, false)
  parentCommunity?: Observable<RemoteData<Community>>;

  // UMD Customization
  /**
   * The CommunityGroup that this Community belongs to.
   * Will be undefined unless the community group HALLink has been resolved.
   */
  @link(COMMUNITY_GROUP, false)
  communityGroup?: Observable<RemoteData<CommunityGroup>>;
  // End UMD Customization

  /**
   * A string representing the unique handle of this Community
   */
  get handle(): string {
    return this.firstMetadataValue('dc.identifier.uri');
  }

  /**
   * The introductory text of this Community
   * Corresponds to the metadata field dc.description
   */
  get introductoryText(): string {
    return this.firstMetadataValue('dc.description');
  }

  /**
   * The short description: HTML
   * Corresponds to the metadata field dc.description.abstract
   */
  get shortDescription(): string {
    return this.firstMetadataValue('dc.description.abstract');
  }

  /**
   * The copyright text of this Community
   * Corresponds to the metadata field dc.rights
   */
  get copyrightText(): string {
    return this.firstMetadataValue('dc.rights');
  }

  /**
   * The sidebar text of this Community
   * Corresponds to the metadata field dc.description.tableofcontents
   */
  get sidebarText(): string {
    return this.firstMetadataValue('dc.description.tableofcontents');
  }

  getParentLinkKey(): keyof this['_links'] {
    return 'parentCommunity';
  }

  // UMD Customization
  getCommunityGroupKey(): keyof this['_links'] {
    return 'communityGroup';
  }
  // End UMD Customization
}
