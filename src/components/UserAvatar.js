import React, { useState } from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import Button from '@material-ui/core/Button';
import ListItem from '@material-ui/core/ListItem';
import Popover from '@material-ui/core/Popover';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Dialog from '@material-ui/core/Dialog';
import CloseIcon from '@material-ui/icons/Close';
import CloudIcon from '@material-ui/icons/Cloud';
import Slide from '@material-ui/core/Slide';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import SignIn from './SignIn';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled';
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import rpcRequest from '../jsonrpc';
import cookies from '../cookies';
const useStyles = makeStyles((theme) => ({
  listItemIcon: {
    minWidth: '3em',
  },
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  paperBottom: {
    bottom: '10%',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function UserAvatar(props) {
  const { drives, updateDrives, setAuthed, setLogged } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();
  const [openAddDrive, setOpenAddDrive] = useState(false);
  const [openRemoveDrive, setOpenRemoveDrive] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);

  // TODO 添加网盘和移除网盘移至Accounts组件
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
  const handleRemoveDrive = (drive_id) => {
    console.log(drive_id);
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

  return (
    <React.Fragment>
      <IconButton color="inherit" onClick={handleClickAvatar}>
        <AccountCircleIcon />
      </IconButton>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseAvatar}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List>
          <ListItem button onClick={handleClickAddDrive}>
            <ListItemIcon className={classes.listItemIcon}>
              <PersonAddIcon />
            </ListItemIcon>
            <ListItemText primary="添加 OneDrive 帐号" />
          </ListItem>
          <ListItem button onClick={handleClickRemoveDrive}>
            <ListItemIcon className={classes.listItemIcon}>
              <PersonAddDisabledIcon />
            </ListItemIcon>
            <ListItemText primary="移除 OneDrive 帐号" />
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
        open={openAddDrive}
        onClose={handleCloseAddDrive}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              添加 OneDrive 帐号
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
        fullWidth
        maxWidth="xs"
        open={openRemoveDrive}
        onClose={handleCloseRemoveDrive}
        classes={{
          paper: classes.paperBottom,
        }}
      >
        <DialogTitle>移除 OneDrive 帐号</DialogTitle>
        <DialogContent>
          <List>
            {drives.map((item, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar>
                    <CloudIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.owner.user.displayName}
                  secondary={item.owner.user.email}
                />
                <ListItemSecondaryAction>
                  <IconButton>
                    <DeleteIcon onClick={() => handleRemoveDrive(item.id)} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveDrive} color="primary">
            完成
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={openLogout}
        onClose={handleCancelLogout}
        classes={{
          paper: classes.paperBottom,
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

UserAvatar.propTypes = {
  drives: PropTypes.array.isRequired,
  updateDrives: PropTypes.func.isRequired,
  setAuthed: PropTypes.func.isRequired,
  setLogged: PropTypes.func.isRequired,
};
