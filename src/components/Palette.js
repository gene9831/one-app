import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Tooltip from '@material-ui/core/Tooltip';
import { connect } from 'react-redux';
import { setPaletteType, PALETTET_YPES } from '../actions';

const { LIGHT, DARK } = PALETTET_YPES;

let Palette = (props) => {
  const { palette, onPaletteTypeClick } = props;

  const isDark = Boolean(palette.type === DARK);
  const switchType = String(isDark ? LIGHT : DARK);
  const title = String(isDark ? '切换亮色主题' : '切换暗色主题');

  return (
    <React.Fragment>
      <Tooltip title={title}>
        <IconButton
          color="inherit"
          onClick={() => onPaletteTypeClick(switchType)}
        >
          {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Tooltip>
    </React.Fragment>
  );
};

Palette.propTypes = {
  palette: PropTypes.shape({
    type: PropTypes.oneOf([LIGHT, DARK]).isRequired,
  }),
  onPaletteTypeClick: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  palette: state.palette,
});

const mapDispatchToProps = (dispatch) => {
  return {
    onPaletteTypeClick: (paletteType) => dispatch(setPaletteType(paletteType)),
  };
};

Palette = connect(mapStateToProps, mapDispatchToProps)(Palette);

export default Palette;
