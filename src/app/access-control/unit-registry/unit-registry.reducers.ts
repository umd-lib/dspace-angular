import { Unit } from 'src/app/core/eperson/models/unit.model';
import { UnitRegistryAction, UnitRegistryActionTypes, UnitRegistryEditUnitAction } from './unit-registry.actions';


/**
 * The metadata registry state.
 * @interface UnitRegistryState
 */
export interface UnitRegistryState {
  editUnit: Unit;
}

/**
 * The initial state.
 */
const initialState: UnitRegistryState = {
  editUnit: null,
};

/**
 * Reducer that handles UnitRegistryActions to modify Units
 * @param state   The current UnitRegistryState
 * @param action  The UnitRegistryAction to perform on the state
 */
export function unitRegistryReducer(state = initialState, action: UnitRegistryAction): UnitRegistryState {

  switch (action.type) {

    case UnitRegistryActionTypes.EDIT_UNIT: {
      return Object.assign({}, state, {
        editUnit: (action as UnitRegistryEditUnitAction).unit
      });
    }

    case UnitRegistryActionTypes.CANCEL_EDIT_UNIT: {
      return Object.assign({}, state, {
        editUnit: null
      });
    }

    default:
      return state;
  }
}
