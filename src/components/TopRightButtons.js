import {
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
} from '@material-ui/core';
import React, { useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import Palette from './Palette';
import SettingsIcon from '@material-ui/icons/Settings';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
  },
}));

const TopRightButtons = ({ classes, ...others }) => {
  const styles = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);
  const downXs = useMediaQuery((theme) => theme.breakpoints.down('xs'));

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={clsx(styles.root, classes.root)} {...others}>
      {downXs ? (
        <>
          <IconButton color="inherit" onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem>
              <Palette />
            </MenuItem>
            <MenuItem>
              <IconButton color="inherit" href="/admin">
                <SettingsIcon />
              </IconButton>
            </MenuItem>
          </Menu>
        </>
      ) : (
        <>
          <Palette />
          <Tooltip title="后台管理">
            <IconButton color="inherit" href="/admin">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </div>
  );
};

TopRightButtons.propTypes = {
  classes: PropTypes.object,
};

TopRightButtons.defaultProps = {
  classes: {},
};

export default TopRightButtons;
