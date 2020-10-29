import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import cookies from '../cookies';
import { connect } from 'react-redux';

const defaultPalettes = {
  light: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
    success: { main: '#4caf50' },
  },
  dark: {
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
    success: { main: '#4caf50' },
  },
};

let Theme = (props) => {
  const { palette, children } = props;

  useEffect(() => {
    cookies.set('palette', palette, { maxAge: 3600 * 60 * 24 });
  }, [palette]);

  const customTheme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          ...defaultPalettes[palette.type ? palette.type : 'light'],
          ...palette,
        },
      }),
    [palette]
  );
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

Theme.propTypes = {
  palette: PropTypes.shape({
    type: PropTypes.oneOf(['light', 'dark']),
  }),
  children: PropTypes.node.isRequired,
};

Theme = connect((state) => ({
  palette: state.palette,
}))(Theme);

export default Theme;
