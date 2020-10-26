import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import AddIcon from '@material-ui/icons/Add';
import CloudIcon from '@material-ui/icons/Cloud';
import DeleteIcon from '@material-ui/icons/Delete';
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import clsx from 'clsx';
import AddDriveDialog from './AddDriveDialog';

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
  title: {
    flex: '1 1 100%',
  },
}));

const EnhancedToolbar = (props) => {
  const classes = useToolbarStyles();
  const { title, numSelected } = props;

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
      {numSelected > 0 ? (
        <Typography
          className={classes.title}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} 已选择
        </Typography>
      ) : (
        <Typography
          className={classes.title}
          variant="h6"
          color="primary"
          component="div"
        >
          {title}
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="删除">
          <IconButton>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </Toolbar>
  );
};

EnhancedToolbar.propTypes = {
  title: PropTypes.string.isRequired,
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(1, 0),
  },
  addDriveItem: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

export default function Accounts(props) {
  const classes = useStyles();
  const { drives, updateDrives } = props;
  const [selected, setSelected] = useState([]);
  const [openAddDrive, setOpenAddDrive] = useState(false);

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const handleClick = (name) => {
    let newSelected = [];

    if (!isSelected(name)) {
      newSelected = selected.concat(name);
    } else {
      newSelected = selected.filter((item) => item !== name);
    }
    setSelected(newSelected);
  };

  return (
    <Grid container className={classes.root}>
      <EnhancedToolbar title="OneDrive 帐号" numSelected={selected.length} />
      <Grid container>
        {drives.map((drive, index) => {
          const isItemSelected = isSelected(drive.id);
          return (
            <Grid item xs={12} sm={12} md={6} key={index}>
              <ListItem
                button
                selected={isItemSelected}
                onClick={() => handleClick(drive.id)}
              >
                <ListItemIcon>
                  <Checkbox checked={isItemSelected} />
                </ListItemIcon>
                <ListItemAvatar>
                  <Avatar>
                    <CloudIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={drive.owner.user.displayName}
                  secondary={drive.owner.user.email}
                />
              </ListItem>
            </Grid>
          );
        })}
        <Grid item xs={12} sm={12} md={6}>
          <ListItem
            button
            className={classes.addDriveItem}
            onClick={() => setOpenAddDrive(true)}
          >
            <ListItemIcon />
            <ListItemAvatar>
              <Avatar>
                <AddIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="添加帐号" />
          </ListItem>
        </Grid>
        <AddDriveDialog
          open={openAddDrive}
          onClose={() => setOpenAddDrive(false)}
          onDriveAdded={updateDrives}
        />
      </Grid>
    </Grid>
  );
}

Accounts.propTypes = {
  drives: PropTypes.array.isRequired,
  updateDrives: PropTypes.func.isRequired,
};
