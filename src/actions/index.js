export const SET_PALETTET_YPE = 'SET_PALETTET_YPE';

export const PALETTET_YPES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const setPaletteType = (paletteType) => {
  return { type: SET_PALETTET_YPE, paletteType };
};

export const SET_GLOBAL_SNACKBAR_MESSAGE = 'SET_GLOBAL_SNACKBAR_MESSAGE';

export const setGlobalSnackbarMessage = (message) => {
  return { type: SET_GLOBAL_SNACKBAR_MESSAGE, message };
};

export const SET_OPERATING_STATUS = 'SET_OPERATING_STATUS';
export const OPERATING_STATUS = {
  READY: 'ready',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
};
export const setOperationStatus = (status) => {
  return { type: SET_OPERATING_STATUS, status };
};
