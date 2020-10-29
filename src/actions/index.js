export const SET_PALETTET_YPE = 'SET_PALETTET_YPE';

export const PALETTET_YPES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const setPaletteType = (paletteType) => {
  return { type: SET_PALETTET_YPE, paletteType };
};
