import { Collection } from 'src/app/core/shared/collection.model';

export class EtdUnitCollectionDtoModel {
  /**
   * The Collection linked to this object
   */
  public collection: Collection;

  /**
   * Whether or not the linked Group is able to be deleted
   */
  public ableToDelete: boolean;

  /**
   * Whether or not the current user is able to edit the linked group
   */
  public ableToEdit: boolean;

  /**
   * Whether or not this Group is a group of the Unit on the page it is being
   * used on.
   */
  public isInEtdUnit: boolean;
}
