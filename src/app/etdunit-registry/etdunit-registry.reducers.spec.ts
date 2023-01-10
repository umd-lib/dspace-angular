import { EtdUnitMock } from 'src/app/shared/testing/etdunit-mock';
import { EtdUnitRegistryCancelUnitAction, EtdUnitRegistryEditEtdUnitAction } from './etdunit-registry.actions';
import { etdunitRegistryReducer, EtdUnitRegistryState } from './etdunit-registry.reducers';

const initialState: EtdUnitRegistryState = {
  editEtdUnit: null,
};

const editState: EtdUnitRegistryState = {
  editEtdUnit: EtdUnitMock,
};

class NullAction extends EtdUnitRegistryEditEtdUnitAction {
  type = null;

  constructor() {
    super(undefined);
  }
}

describe('etdunitRegistryReducer', () => {

  it('should return the current state when no valid actions have been made', () => {
    const state = initialState;
    const action = new NullAction();
    const newState = etdunitRegistryReducer(state, action);

    expect(newState).toEqual(state);
  });

  it('should start with an initial state', () => {
    const state = initialState;
    const action = new NullAction();
    const initState = etdunitRegistryReducer(undefined, action);

    expect(initState).toEqual(state);
  });

  it('should update the current state to change the editEtdUnit to a new etdunit when EtdUnitRegistryEditEtdUnitAction is dispatched', () => {
    const state = editState;
    const action = new EtdUnitRegistryEditEtdUnitAction(EtdUnitMock);
    const newState = etdunitRegistryReducer(state, action);

    expect(newState.editEtdUnit).toEqual(EtdUnitMock);
  });

  it('should update the current state to remove the editEtdUnit from the state when EtdUnitRegistryCancelUnitAction is dispatched', () => {
    const state = editState;
    const action = new EtdUnitRegistryCancelUnitAction();
    const newState = etdunitRegistryReducer(state, action);

    expect(newState.editEtdUnit).toEqual(null);
  });
});
