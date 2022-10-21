import { UnitMock } from 'src/app/shared/testing/unit-mock';
import { UnitRegistryCancelUnitAction, UnitRegistryEditUnitAction } from './unit-registry.actions';
import { unitRegistryReducer, UnitRegistryState } from './unit-registry.reducers';

const initialState: UnitRegistryState = {
  editUnit: null,
};

const editState: UnitRegistryState = {
  editUnit: UnitMock,
};

class NullAction extends UnitRegistryEditUnitAction {
  type = null;

  constructor() {
    super(undefined);
  }
}

describe('unitRegistryReducer', () => {

  it('should return the current state when no valid actions have been made', () => {
    const state = initialState;
    const action = new NullAction();
    const newState = unitRegistryReducer(state, action);

    expect(newState).toEqual(state);
  });

  it('should start with an initial state', () => {
    const state = initialState;
    const action = new NullAction();
    const initState = unitRegistryReducer(undefined, action);

    expect(initState).toEqual(state);
  });

  it('should update the current state to change the editUnit to a new unit when UnitRegistryEditUnitAction is dispatched', () => {
    const state = editState;
    const action = new UnitRegistryEditUnitAction(UnitMock);
    const newState = unitRegistryReducer(state, action);

    expect(newState.editUnit).toEqual(UnitMock);
  });

  it('should update the current state to remove the editUnit from the state when UnitRegistryCancelUnitAction is dispatched', () => {
    const state = editState;
    const action = new UnitRegistryCancelUnitAction();
    const newState = unitRegistryReducer(state, action);

    expect(newState.editUnit).toEqual(null);
  });
});
