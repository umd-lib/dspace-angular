import { PaginatedList } from '../../data/paginated-list.model';
import { Group } from './group.model';
import { Unit } from './unit.model';

/**
 * This class serves as a Data Transfer Model that contains the Unit,
 * whether or not it's able to be deleted and its members
 */
export class UnitDtoModel {

  /**
   * The Unit linked to this object
   */
  public unit: Unit;

  /**
   * Whether or not the linked Unit is able to be deleted
   */
  public ableToDelete: boolean;

  /**
   * Whether or not the current user is able to edit the linked unit
   */
  public ableToEdit: boolean;

  /**
   * List of groups that are a part of this unit
   */
  public groups: PaginatedList<Group>;
}
