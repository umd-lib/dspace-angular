import { EtdUnit } from './models/etdunit.model';
import { EtdUnitRegistryAction, EtdUnitRegistryActionTypes, EtdUnitRegistryEditEtdUnitAction } from './etdunit-registry.actions';


/**
 * The metadata registry state.
 * @interface EtdUnitRegistryState
 */
export interface EtdUnitRegistryState {
  editEtdUnit: EtdUnit;
}

/**
 * The initial state.
 */
const initialState: EtdUnitRegistryState = {
  editEtdUnit: null,
};

/**
 * Reducer that handles EtdUnitRegistryActions to modify EtdUnits
 * @param state   The current EtdUnitRegistryState
 * @param action  The EtdUnitRegistryAction to perform on the state
 */
export function etdunitRegistryReducer(state = initialState, action: EtdUnitRegistryAction): EtdUnitRegistryState {

  switch (action.type) {

    case EtdUnitRegistryActionTypes.EDIT_UNIT: {
      return Object.assign({}, state, {
        editEtdUnit: (action as EtdUnitRegistryEditEtdUnitAction).etdunit
      });
    }

    case EtdUnitRegistryActionTypes.CANCEL_EDIT_UNIT: {
      return Object.assign({}, state, {
        editEtdUnit: null
      });
    }

    default:
      return state;
  }
}
