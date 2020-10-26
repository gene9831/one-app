import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import { colors as defaultColors } from '@material-ui/core';
import cookies from '../cookies';

const colors = Object.assign({}, defaultColors);
delete colors.common;

export default function Palette(props) {
  const { palette, setPalette } = props;
  const didMount = useRef(true);

  const handleSwitchLightDark = () => {
    setPalette({
      ...palette,
      type: palette.type === 'light' ? 'dark' : 'light',
    });
  };

  useEffect(() => {
    // 从cookie中获取配色
    const cookiePalette = cookies.get('palette');
    if (cookiePalette) {
      setPalette(cookiePalette);
    }
  }, [setPalette]);

  useEffect(() => {
    if (didMount.current) didMount.current = false;
    else {
      // 每当设置了自定义配色，都会更新cookie
      cookies.set('palette', palette, { maxAge: 3600 * 24 * 30 });
    }
  }, [palette]);

  return (
    <React.Fragment>
      <IconButton color="inherit" onClick={handleSwitchLightDark}>
        {palette.type === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </React.Fragment>
  );
}

Palette.propTypes = {
  palette: PropTypes.object.isRequired,
  setPalette: PropTypes.func.isRequired,
};
