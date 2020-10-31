import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  lighten,
  fade,
  makeStyles,
  styled,
  useTheme,
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import CloudIcon from '@material-ui/icons/Cloud';
import DeleteIcon from '@material-ui/icons/Delete';
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AddDriveDialog from './AddDriveDialog';
import Paper from '@material-ui/core/Paper';
import rpcRequest from '../jsonrpc';
import Container from '@material-ui/core/Container';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import { useMediaQuery } from '@material-ui/core';
import UpdateIcon from '@material-ui/icons/Update';
import SyncIcon from '@material-ui/icons/Sync';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import { connect } from 'react-redux';
import { setGlobalSnackbarMessage } from '../actions';

const MyToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

const useSelectedToobarStyles = makeStyles((theme) => ({
  selectedToolbar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    ...(theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.75),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        }),
  },
  title: {
    flex: '1 1 100%',
    padding: theme.spacing(0, 1),
  },
}));

const SelectedTooBar = (props) => {
  const classes = useSelectedToobarStyles();
  const { numSelected, onDelete, onUpdate, onFullUpdate, onCancel } = props;
  return (
    <Fade in={numSelected > 0}>
      <MyToolbar className={classes.selectedToolbar}>
        <Tooltip title="取消">
          <IconButton color="inherit" onClick={onCancel}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
        <Typography
          variant="subtitle1"
          component="div"
          className={classes.title}
        >
          {numSelected} 已选择
        </Typography>
        <Tooltip title="更新">
          <IconButton color="inherit" onClick={onUpdate}>
            <UpdateIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="全量更新">
          <IconButton color="inherit" onClick={onFullUpdate}>
            <AutorenewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="删除">
          <IconButton color="inherit" onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </MyToolbar>
    </Fade>
  );
};

SelectedTooBar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  onFullUpdate: PropTypes.func,
  onCancel: PropTypes.func,
};

const useMessageDialogStyles = makeStyles((theme) => ({
  primaryColor: {
    color: theme.palette.primary.main,
  },
  secondaryColor: {
    color: theme.palette.secondary.main,
  },
  progress: {
    margin: theme.spacing(1, 0),
    display: 'flex',
    justifyContent: 'center',
  },
}));

const MessageDialog = (props) => {
  const classes = useMessageDialogStyles();
  const {
    open,
    title,
    description,
    numSelected,
    comfirming,
    onConfirm,
    onClose,
  } = props;
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {description ? (
            <React.Fragment>
              {description}
              <br />
            </React.Fragment>
          ) : null}
          确定<span className={classes.secondaryColor}>{title}</span>{' '}
          <b className={classes.primaryColor}>{numSelected}</b> 个 OneDrive 吗？
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={onClose} disabled={comfirming}>
          取消
        </Button>
        <Button color="primary" onClick={onConfirm} disabled={comfirming}>
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
};

MessageDialog.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  description: PropTypes.string,
  numSelected: PropTypes.number,
  comfirming: PropTypes.bool,
  onConfirm: PropTypes.func,
  onClose: PropTypes.func,
};

const useStyles = makeStyles((theme) => {
  const listItemBgColor =
    theme.palette.type === 'light'
      ? fade(theme.palette.secondary.main, 0.08)
      : fade(theme.palette.secondary.main, 0.24);
  return {
    root: {
      margin: theme.spacing(3, 0),
      [theme.breakpoints.down('xs')]: {
        margin: theme.spacing(2, 0),
      },
      position: 'relative',
    },
    listItem: {
      '&$listItemSeleted': {
        backgroundColor: listItemBgColor,
        '&:hover': {
          backgroundColor: listItemBgColor,
        },
      },
    },
    listItemSeleted: {},
    '@keyframes rotateEffect': {
      '25%': {
        transform: 'rotate(-180deg)',
      },
      '50%': {
        transform: 'rotate(-180deg)',
      },
      '75%': {
        transform: 'rotate(-360deg)',
      },
      '100%': {
        transform: 'rotate(-360deg)',
      },
    },
    sync: {
      animation: '$rotateEffect 2s linear 0s infinite',
    },
  };
});

const resultToMessage = (result) => {
  if (typeof result === 'number') {
    return `已移除${result}个 OneDrive`;
  }
  if (result.added === 0 && result.deleted === 0 && result.updated === 0) {
    return '无更新';
  }
  let res = '';
  if (result.added > 0) {
    res += `新增${result.added}个项目，`;
  }
  if (result.updated > 0) {
    res += `更新${result.updated}个项目，`;
  }
  if (result.deleted > 0) {
    res += `删除${result.deleted}个项目，`;
  }
  return res.slice(0, -1);
};

let Accounts = (props) => {
  const classes = useStyles();
  const { drives, updateDrives, setGlobalSnackbarMessage } = props;
  const [selected, setSelected] = useState([]);
  const [openAddDrive, setOpenAddDrive] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);

  const [openFullUpdateDialog, setOpenFullUpdateDialog] = useState(false);
  const [fullUpdateConfirming, setFullUpdateConfirming] = useState(false);

  const [updateConfirming, setUpdateConfirming] = useState(false);

  const theme = useTheme();
  const mediaUpSm = useMediaQuery(theme.breakpoints.up('sm'));

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

  const handleOperateDrives = (method, setConfirming, setOpenDialog) => {
    setConfirming(true);
    if (setOpenDialog) setOpenDialog(false);
    setSelected([]);
    setGlobalSnackbarMessage('');

    const fetchData = async () => {
      let res = await rpcRequest(method, {
        params: [selected],
        require_auth: true,
      });
      // 加 await 保证当前页面 drive 数据最新
      await updateDrives();
      setConfirming(false);
      console.log(res);
      setGlobalSnackbarMessage(resultToMessage(res.data.result));
    };

    fetchData().catch((e) => {
      setConfirming(false);
      if (e.response) {
        setGlobalSnackbarMessage('操作失败');
      } else {
        setGlobalSnackbarMessage('网络错误');
      }
    });
  };

  const handleRemoveDrives = () => {
    handleOperateDrives(
      'Onedrive.signOut',
      setDeleteConfirming,
      setOpenDeleteDialog
    );
  };

  const handleFullUpdateDrives = () => {
    handleOperateDrives(
      'Onedrive.fullUpdateItems',
      setFullUpdateConfirming,
      setOpenFullUpdateDialog
    );
  };

  const handleUpdateDrives = () => {
    handleOperateDrives('Onedrive.updateItems', setUpdateConfirming);
  };

  return (
    <Container>
      <Paper className={classes.root}>
        <MyToolbar>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setOpenAddDrive(true)}
          >
            添加帐号
          </Button>
          <div style={{ flex: 1 }}></div>
          {deleteConfirming || updateConfirming || fullUpdateConfirming ? (
            <Tooltip title="离开此页面更新状态会丢失">
              <SyncIcon className={classes.sync} />
            </Tooltip>
          ) : null}
        </MyToolbar>
        <SelectedTooBar
          numSelected={selected.length}
          onDelete={() => setOpenDeleteDialog(true)}
          onUpdate={handleUpdateDrives}
          onFullUpdate={() => setOpenFullUpdateDialog(true)}
          onCancel={() => setSelected([])}
        />
        <Grid container>
          {drives.map((drive, index) => {
            const isItemSelected = isSelected(drive.id);
            return (
              <Grid item xs={12} sm={12} md={6} key={index}>
                <ListItem
                  button
                  selected={isItemSelected}
                  classes={{
                    root: classes.listItem,
                    selected: classes.listItemSeleted,
                  }}
                >
                  {mediaUpSm ? (
                    <ListItemIcon>
                      <Checkbox
                        checked={isItemSelected}
                        onClick={() => handleClick(drive.id)}
                      />
                    </ListItemIcon>
                  ) : null}
                  <ListItemAvatar
                    onClick={!mediaUpSm ? () => handleClick(drive.id) : null}
                  >
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
        </Grid>
        <AddDriveDialog
          open={openAddDrive}
          onClose={() => setOpenAddDrive(false)}
          onDriveAdded={updateDrives}
        />
        <MessageDialog
          open={openDeleteDialog}
          title="移除"
          numSelected={selected.length}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleRemoveDrives}
          comfirming={deleteConfirming}
        />
        <MessageDialog
          open={openFullUpdateDialog}
          title="全量更新"
          description="此操作会先删除大部分数据后再更新，操作时间较长"
          numSelected={selected.length}
          onClose={() => setOpenFullUpdateDialog(false)}
          onConfirm={handleFullUpdateDrives}
          comfirming={fullUpdateConfirming}
        />
      </Paper>
    </Container>
  );
};

Accounts.propTypes = {
  drives: PropTypes.array.isRequired,
  updateDrives: PropTypes.func.isRequired,
  setGlobalSnackbarMessage: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    setGlobalSnackbarMessage: (message) =>
      dispatch(setGlobalSnackbarMessage(message)),
  };
};

Accounts = connect(null, mapDispatchToProps)(Accounts);

export default Accounts;
