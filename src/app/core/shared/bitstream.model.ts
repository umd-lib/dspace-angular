import { autoserialize, deserialize, inheritSerialization } from 'cerialize';
import { Observable } from 'rxjs';
import { link, typedObject } from '../cache/builders/build-decorators';
import { RemoteData } from '../data/remote-data';
import { BitstreamFormat } from './bitstream-format.model';
import { BITSTREAM_FORMAT } from './bitstream-format.resource-type';
import { BITSTREAM } from './bitstream.resource-type';
import { DSpaceObject } from './dspace-object.model';
import { HALLink } from './hal-link.model';
import {BUNDLE} from './bundle.resource-type';
import {Bundle} from './bundle.model';
import { ChildHALResource } from './child-hal-resource.model';

@typedObject
@inheritSerialization(DSpaceObject)
export class Bitstream extends DSpaceObject implements ChildHALResource {
  static type = BITSTREAM;

  /**
   * The size of this bitstream in bytes
   */
  @autoserialize
  sizeBytes: number;

  /**
   * The description of this Bitstream
   */
  @autoserialize
  description: string;

  /**
   * The name of the Bundle this Bitstream is part of
   */
  @autoserialize
  bundleName: string;

  /**
   * The {@link HALLink}s for this Bitstream
   */
  @deserialize
  _links: {
    self: HALLink;
    bundle: HALLink;
    format: HALLink;
    content: HALLink;
    thumbnail: HALLink;
  };

  /**
   * The thumbnail for this Bitstream
   * Will be undefined unless the thumbnail {@link HALLink} has been resolved.
   */
  @link(BITSTREAM, false, 'thumbnail')
  thumbnail?: Observable<RemoteData<Bitstream>>;

  /**
   * The BitstreamFormat of this Bitstream
   * Will be undefined unless the format {@link HALLink} has been resolved.
   */
  @link(BITSTREAM_FORMAT, false, 'format')
  format?: Observable<RemoteData<BitstreamFormat>>;

  /**
   * The owning bundle for this Bitstream
   * Will be undefined unless the bundle{@link HALLink} has been resolved.
   */
  @link(BUNDLE)
  bundle?: Observable<RemoteData<Bundle>>;

  // UMD Customization
  /**
   * A String indicating whether (and how long) this object has restricted
   * access due to an embargo:
   *
   * - A date string (in "yyyy-MM-DD" format) - The lift date of the embargo
   * - "FOREVER" - the embargo restriction is forever
   * - "NONE" - there is no embargo restriction
   */
  @autoserialize
  embargoRestriction: string;
  // End UMD Customization

  getParentLinkKey(): keyof this['_links'] {
    return 'format';
  }

  /**
   * Returns true if this bitstream has active embargo restrictions,
   * false otherwise.
   */
  isEmbargoed() {
    if (this.embargoRestriction === undefined) {
      // This is a "new" bitstream (i.e. just uploaded for a submission), so
      // simply return false
      return false;
    } else {
      return 'NONE' !== this.embargoRestriction;
    }
  }
}
