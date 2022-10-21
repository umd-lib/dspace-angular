import { DSpaceObject } from '../../shared/dspace-object.model';
import {autoserialize, autoserializeAs, deserialize, inheritSerialization} from 'cerialize';
import { link, typedObject } from '../../cache/builders/build-decorators';
import { HALLink } from 'src/app/core/shared/hal-link.model';
import { GROUP } from 'src/app/core/eperson/models/group.resource-type';
import { Observable } from 'rxjs';
import { RemoteData } from 'src/app/core/data/remote-data';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { Group } from 'src/app/core/eperson/models/group.model';
import { UNIT } from './unit.resource-type';
import { excludeFromEquals } from '../../utilities/equals.decorators';

@typedObject
@inheritSerialization(DSpaceObject)
export class Unit extends DSpaceObject {
  static type = UNIT;

  /**
   * A string representing the unique name of this Unit
   */
  @excludeFromEquals
  @autoserializeAs('name')
  protected _name: string;

  /**
   * A boolean denoting whether this Unit is faculty-only
   */
  @autoserialize
  facultyOnly: boolean;

  /**
   * A string representing the unique handle of this Unit
   */
  @autoserialize
  handle: string;

  /**
   * The {@link HALLink}s for this Unit
   */
  @deserialize
  _links: {
    self: HALLink;
    groups: HALLink;
  };

  /**
   * The list of Groups that are a part of this Unit
   * Will be undefined unless the groups {@link HALLink} has been resolved.
   */
  @link(GROUP, true)
  public groups?: Observable<RemoteData<PaginatedList<Group>>>;
}
