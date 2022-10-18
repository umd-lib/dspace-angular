/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';
import { Unit } from 'src/app/core/eperson/models/unit.model';
import { type } from '../../shared/ngrx/type';

/**
 * For each action type in an action unit, make a simple
 * enum object for all of this unit's action types.
 *
 * The 'type' utility function coerces strings into string
 * literal types and runs a simple check to guarantee all
 * action types in the application are unique.
 */
export const UnitRegistryActionTypes = {

  EDIT_UNIT: type('dspace/unit-registry/EDIT_UNIT'),
  CANCEL_EDIT_UNIT: type('dspace/unit-registry/CANCEL_EDIT_UNIT'),
};

/**
 * Used to edit a Unit in the Unit registry
 */
export class UnitRegistryEditUnitAction implements Action {
  type = UnitRegistryActionTypes.EDIT_UNIT;

  unit: Unit;

  constructor(unit: Unit) {
    this.unit = unit;
  }
}

/**
 * Used to cancel the editing of a Unit in the Unit registry
 */
export class UnitRegistryCancelUnitAction implements Action {
  type = UnitRegistryActionTypes.CANCEL_EDIT_UNIT;
}


/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 * These are all the actions to perform on the Unit registry state
 */
export type UnitRegistryAction
  = UnitRegistryEditUnitAction
  | UnitRegistryCancelUnitAction;
