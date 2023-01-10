/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';
import { EtdUnit } from './models/etdunit.model';
import { type } from '../shared/ngrx/type';

/**
 * For each action type in an action etdunit, make a simple
 * enum object for all of this etdunit's action types.
 *
 * The 'type' utility function coerces strings into string
 * literal types and runs a simple check to guarantee all
 * action types in the application are unique.
 */
export const EtdUnitRegistryActionTypes = {
  EDIT_UNIT: type('dspace/etdunit-registry/EDIT_UNIT'),
  CANCEL_EDIT_UNIT: type('dspace/etdunit-registry/CANCEL_EDIT_UNIT'),
};

/**
 * Used to edit a EtdUnit in the EtdUnit registry
 */
export class EtdUnitRegistryEditEtdUnitAction implements Action {
  type = EtdUnitRegistryActionTypes.EDIT_UNIT;

  etdunit: EtdUnit;

  constructor(etdunit: EtdUnit) {
    this.etdunit = etdunit;
  }
}

/**
 * Used to cancel the editing of a EtdUnit in the EtdUnit registry
 */
export class EtdUnitRegistryCancelUnitAction implements Action {
  type = EtdUnitRegistryActionTypes.CANCEL_EDIT_UNIT;
}


/**
 * Export a type alias of all actions in this action collection
 * so that reducers can easily compose action types
 * These are all the actions to perform on the EtdUnit registry state
 */
export type EtdUnitRegistryAction
  = EtdUnitRegistryEditEtdUnitAction
  | EtdUnitRegistryCancelUnitAction;
