import { combineReducers } from 'redux';
import { SET_PALETTET_YPE, PALETTET_YPES } from '../actions';
const { LIGHT } = PALETTET_YPES;

const palette = (state = { type: LIGHT }, action) => {
  switch (action.type) {
    case SET_PALETTET_YPE:
      return {
        ...state,
        type: action.paletteType,
      };
    default:
      return state;
  }
};

const CombinedState = combineReducers({
  palette,
});

export default CombinedState;
