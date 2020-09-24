import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import Popover from '@material-ui/core/Popover';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import CloudIcon from '@material-ui/icons/Cloud';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles(() => ({
  listItemIcon: {
    minWidth: '2.5rem',
  },
}));

export default function MultiUersAvatar(props) {
  const { drive, drives, setDrive } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles();

  const handleClickAvatar = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseAvatar = () => {
    setAnchorEl(null);
  };
  const openPopover = Boolean(anchorEl);

  const handleClickUser = (drive) => {
    setDrive(drive);
    handleCloseAvatar();
  };

  return (
    <React.Fragment>
      <Button color="inherit" onClick={handleClickAvatar}>
        <span>
          {drive === null ? 'example@email.com' : drive.owner.user.email}
        </span>
        <ExpandMoreIcon></ExpandMoreIcon>
      </Button>
      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleCloseAvatar}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List className={classes.root}>
          {drives.map((drive, index) => (
            <ListItem button key={index} onClick={() => handleClickUser(drive)}>
              <ListItemIcon className={classes.listItemIcon}>
                <CloudIcon></CloudIcon>
              </ListItemIcon>
              <ListItemText primary={drive.owner.user.email} />
            </ListItem>
          ))}
        </List>
      </Popover>
    </React.Fragment>
  );
}

MultiUersAvatar.propTypes = {
  drive: PropTypes.object,
  drives: PropTypes.array.isRequired,
  setDrive: PropTypes.func.isRequired,
};
