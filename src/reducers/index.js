import { combineReducers } from 'redux';
import {
  SET_PALETTET_YPE,
  PALETTET_YPES,
  SET_GLOBAL_SNACKBAR_MESSAGE,
  SET_OPERATING_STATUS,
  OPERATING_STATUS,
} from '../actions';

const palette = (state = { type: PALETTET_YPES.LIGHT }, action) => {
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

const globalSnackbarMessage = (state = '', action) => {
  switch (action.type) {
    case SET_GLOBAL_SNACKBAR_MESSAGE:
      return action.message;
    default:
      return state;
  }
};

const operationStatus = (state = OPERATING_STATUS.READY, action) => {
  switch (action.type) {
    case SET_OPERATING_STATUS:
      return action.status;
    default:
      return state;
  }
};

const CombinedState = combineReducers({
  palette,
  globalSnackbarMessage,
  operationStatus,
});

export default CombinedState;
