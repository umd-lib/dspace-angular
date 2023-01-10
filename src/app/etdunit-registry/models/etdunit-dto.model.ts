import { PaginatedList } from '../../core/data/paginated-list.model';
import { Collection } from 'src/app/core/shared/collection.model';
import { EtdUnit } from './etdunit.model';

/**
 * This class serves as a Data Transfer Model that contains the EtdUnit,
 * whether or not it's able to be deleted and its members
 */
export class EtdUnitDtoModel {

  /**
   * The EtdUnit linked to this object
   */
  public etdunit: EtdUnit;

  /**
   * Whether or not the linked EtdUnit is able to be deleted
   */
  public ableToDelete: boolean;

  /**
   * Whether or not the current user is able to edit the linked etdunit
   */
  public ableToEdit: boolean;

  /**
   * List of collections that are a part of this etdunit
   */
  public collections: PaginatedList<Collection>;
}
