import { autoserialize, autoserializeAs, deserialize, inheritSerialization } from 'cerialize';
import { typedObject } from '../../cache/builders/build-decorators';

import { DSpaceObject } from '../../shared/dspace-object.model';
import { HALLink } from '../../shared/hal-link.model';
import { LDAP } from './ldap.resource-type';
import { excludeFromEquals } from '../../utilities/equals.decorators';
import { Group } from './group.model';
import { Unit } from './unit.model';

@typedObject
@inheritSerialization(DSpaceObject)
export class Ldap extends DSpaceObject {
  static type = LDAP;

  /**
   * A string representing the unique name of this Group
   */
  @excludeFromEquals
  @autoserializeAs('name')
  protected _name: string;

  /**
   * A string representing the unique handle of this Group
   */
  @autoserialize
  public handle: string;

  /**
   * A string representing the user's first name
   */
  @autoserialize
  public firstName: string;

  /**
   * A string representing the user's last name
   */
  @autoserialize
  public lastName: string;

  /**
   * A string representing the user's phone number
   */
   @autoserialize
   public phone: string;

  /**
   * The user's email address
   */
  @autoserialize
  public email: string;

  /**
   * True if the user is faculty, false otherwise
   */
   @autoserialize
   public isFaculty: boolean;

   /**
   * An array representing the user's UM appointments
   */
  @autoserialize
  public umAppointments: string[];

  /**
   * The {@link HALLink}s for this Group
   */
  @deserialize
  _links: {
    self: HALLink;
  };

  @autoserialize
  public groups: Group[];

  @autoserialize
  public matchedUnits: Unit[];

  @autoserialize
  public unmatchedUnits: string[];
}
