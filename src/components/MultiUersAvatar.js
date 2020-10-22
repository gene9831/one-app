import React, { useState } from 'react';
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
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Dialog from '@material-ui/core/Dialog';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import SignIn from './SignIn';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import rpcRequest from '../jsonrpc';
import cookies from '../cookies';
const useStyles = makeStyles((theme) => ({
  listItemIcon: {
    minWidth: '2.5rem',
  },
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  paperScrollPaper: {
    bottom: '10%',
    minWidth: 300,
  },
  lowercase: {
    textTransform: 'none',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function MultiUersAvatar(props) {
  const { drive, drives, setDrive, updateDrives, setAuthed, setLogged } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();
  const [openAddDrive, setOpenAddDrive] = useState(false);
  const [openRemoveDrive, setOpenRemoveDrive] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);

  // Add Drive
  const handleClickAddDrive = () => {
    handleCloseAvatar();
    setOpenAddDrive(true);
  };
  const handleCloseAddDrive = () => {
    setOpenAddDrive(false);
  };
  const handleDriveAdded = () => {
    updateDrives();
  };

  // Remove Drive
  const handleClickRemoveDrive = () => {
    handleCloseAvatar();
    setOpenRemoveDrive(true);
  };
  const handleCloseRemoveDrive = () => {
    setOpenRemoveDrive(false);
  };
  const handleDriveRemoved = () => {
    if (drive) {
      const fetchData = async () => {
        await rpcRequest('Onedrive.signOut', {
          params: [drive.id],
          require_auth: true,
        });
        updateDrives();
      };
      fetchData();
    }
    setOpenRemoveDrive(false);
  };

  // Logout
  const handleClickLogout = () => {
    handleCloseAvatar();
    setOpenLogout(true);
  };
  const handleCancelLogout = () => {
    setOpenLogout(false);
  };
  const handleLogout = () => {
    const fetchData = async () => {
      await rpcRequest('Admin.logout', {
        params: [cookies.get('token')],
        require_auth: true,
      });
      setAuthed(false);
      setLogged(false);
      cookies.remove('token');
    };
    fetchData();
  };

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
        <span className={classes.lowercase}>
          {drive ? drive.owner.user.email : 'example@email.com'}
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
          <ListItem button onClick={handleClickAddDrive}>
            <ListItemIcon className={classes.listItemIcon}>
              <PersonAddIcon />
            </ListItemIcon>
            <ListItemText primary="添加 OneDrive" />
          </ListItem>
          <ListItem button onClick={handleClickRemoveDrive}>
            <ListItemIcon className={classes.listItemIcon}>
              <PersonAddDisabledIcon />
            </ListItemIcon>
            <ListItemText primary="移除 OneDrive" />
          </ListItem>
          <ListItem button onClick={handleClickLogout}>
            <ListItemIcon className={classes.listItemIcon}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="退出" />
          </ListItem>
        </List>
      </Popover>
      <Dialog
        fullScreen
        maxWidth="sm"
        open={openAddDrive}
        onClose={handleCloseAddDrive}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              添加 OneDrive
            </Typography>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseAddDrive}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <SignIn
          setOpenAddDrive={setOpenAddDrive}
          handleDriveAdded={handleDriveAdded}
        />
      </Dialog>
      <Dialog
        open={openRemoveDrive}
        onClose={handleCloseRemoveDrive}
        classes={{
          paperScrollPaper: classes.paperScrollPaper,
        }}
      >
        <DialogTitle>移除 OneDrive</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定移除账号 {<b>{drive ? drive.owner.user.email : ''}</b>} 吗？
            所有有关数据将被删除
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDrive} color="secondary">
            取消
          </Button>
          <Button onClick={handleDriveRemoved} color="primary">
            确定
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openLogout}
        onClose={handleCancelLogout}
        classes={{
          paperScrollPaper: classes.paperScrollPaper,
        }}
      >
        <DialogTitle>退出</DialogTitle>
        <DialogContent>
          <DialogContentText>确定退出吗？</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLogout} color="secondary">
            取消
          </Button>
          <Button onClick={handleLogout} color="primary">
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

MultiUersAvatar.propTypes = {
  drive: PropTypes.object,
  drives: PropTypes.array.isRequired,
  setDrive: PropTypes.func.isRequired,
  updateDrives: PropTypes.func.isRequired,
  setAuthed: PropTypes.func.isRequired,
  setLogged: PropTypes.func.isRequired,
};
