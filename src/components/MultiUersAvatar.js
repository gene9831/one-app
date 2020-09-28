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
import Cookies from 'universal-cookie';
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
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Axios from 'axios';
import { OD_ADMIN_API } from '../App';
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
  },
  lowercase: {
    textTransform: 'none',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const cookies = new Cookies();
export default function MultiUersAvatar(props) {
  const { drive, drives, setDrive, updateDrives } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignOut, setOpenSignOut] = useState(false);

  const handleClickSignIn = () => {
    handleCloseAvatar();
    setOpenSignIn(true);
  };

  const handleClickSignOut = () => {
    handleCloseAvatar();
    setOpenSignOut(true);
  };

  const handleCloseSignIn = () => {
    setOpenSignIn(false);
  };

  const handleCloseSignOut = () => {
    setOpenSignOut(false);
  };

  const handleSignIn = () => {
    updateDrives();
  };

  const handleSignOut = () => {
    if (drive) {
      const fetchData = async () => {
        await Axios.post(
          OD_ADMIN_API,
          {
            jsonrpc: '2.0',
            method: 'Onedrive.signOut',
            params: [drive.id],
            id: '1',
          },
          { headers: { 'X-Password': 'secret' } }
        );
        updateDrives();
      };
      fetchData();
    }
    handleCloseSignOut();
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
    cookies.set('drive', JSON.stringify(drive), {
      path: '/',
      maxAge: 3600 * 24 * 30,
    });
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
          <ListItem button onClick={handleClickSignIn}>
            <ListItemIcon className={classes.listItemIcon}>
              <PersonAddIcon />
            </ListItemIcon>
            <ListItemText primary="添加帐号" />
          </ListItem>
          <ListItem button onClick={handleClickSignOut}>
            <ListItemIcon className={classes.listItemIcon}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="注销" color="secondary" />
          </ListItem>
        </List>
      </Popover>
      <Dialog
        fullScreen
        maxWidth="sm"
        open={openSignIn}
        onClose={handleCloseSignIn}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              登录
            </Typography>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseSignIn}
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <SignIn setOpenSignIn={setOpenSignIn} handleSignIn={handleSignIn} />
      </Dialog>
      <Dialog
        open={openSignOut}
        onClose={handleCloseSignOut}
        classes={{
          paperScrollPaper: classes.paperScrollPaper,
        }}
      >
        <DialogTitle>注销</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定注销账号 {<b>{drive ? drive.owner.user.email : ''}</b>} 吗？
            所有有关数据将被删除
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSignOut} color="secondary">
            取消
          </Button>
          <Button onClick={handleSignOut} color="primary">
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
};
