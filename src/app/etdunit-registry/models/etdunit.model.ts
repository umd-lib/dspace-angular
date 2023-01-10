import { DSpaceObject } from '../../core/shared/dspace-object.model';
import { autoserialize, autoserializeAs, deserialize, inheritSerialization } from 'cerialize';
import { link, typedObject } from '../../core/cache/builders/build-decorators';
import { HALLink } from 'src/app/core/shared/hal-link.model';
import { COLLECTION } from 'src/app/core/shared/collection.resource-type';
import { Observable } from 'rxjs';
import { RemoteData } from 'src/app/core/data/remote-data';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { Collection } from 'src/app/core/shared/collection.model';
import { ETDUNIT } from './etdunit.resource-type';
import { excludeFromEquals } from '../../core/utilities/equals.decorators';

@typedObject
@inheritSerialization(DSpaceObject)
export class EtdUnit extends DSpaceObject {
  static type = ETDUNIT;

  /**
   * A string representing the unique name of this EtdUnit
   */
  @excludeFromEquals
  @autoserializeAs('name')
  protected _name: string;

  /**
   * A string representing the unique handle of this EtdUnit
   */
  @autoserialize
  handle: string;

  /**
   * The {@link HALLink}s for this EtdUnit
   */
  @deserialize
  _links: {
    self: HALLink;
    collections: HALLink;
  };

  /**
   * The list of Collections that are a part of this EtdUnit
   * Will be undefined unless the collections {@link HALLink} has been resolved.
   */
  @link(COLLECTION, true)
  public collections?: Observable<RemoteData<PaginatedList<Collection>>>;
}
