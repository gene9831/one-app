import { Button, Menu, MenuItem, Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';

const DriveSelector = (props) => {
  const { driveIds, idIndex, onClickItem } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const text = useMemo(() => {
    if (driveIds.length === 0) {
      return '没有网盘';
    }
    return `网盘${idIndex + 1}`;
  }, [driveIds, idIndex]);

  const handleClick = (e) => {
    if (driveIds.length > 0) setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickItem = (e) => {
    onClickItem(e);
    setAnchorEl(null);
  };

  return (
    <div>
      <Button onClick={handleClick}>
        <Typography>{text}</Typography>
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {driveIds.map((driveId, index) => (
          <MenuItem key={index} id={index} onClick={handleClickItem}>
            网盘{index + 1}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

DriveSelector.propTypes = {
  driveIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  idIndex: PropTypes.number.isRequired,
  onClickItem: PropTypes.func.isRequired,
};

DriveSelector.defaultProps = {
  driveIds: [],
  idIndex: 0,
  onClickItem: () => {},
};

export default DriveSelector;
