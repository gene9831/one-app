import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { fade, makeStyles, styled } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import CloudIcon from '@material-ui/icons/Cloud';
import DeleteIcon from '@material-ui/icons/Delete';
import Avatar from '@material-ui/core/Avatar';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Toolbar from '@material-ui/core/Toolbar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AddDriveDialog from './AddDriveDialog';
import Paper from '@material-ui/core/Paper';
import apiRequest from '../api';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Checkbox from '@material-ui/core/Checkbox';
import {
  ListItemSecondaryAction,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import UpdateIcon from '@material-ui/icons/Update';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import { connect } from 'react-redux';
import {
  setGlobalSnackbarMessage,
  setOperationStatus,
  OPERATING_STATUS,
} from '../actions';
import SelectedToobar from './SelectedToobar';
import { bTokmg } from '../utils';

const MyToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  [theme.breakpoints.down('xs')]: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
}));

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
  const { open, title, description, numSelected, onConfirm, onClose } = props;
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
        <Button color="secondary" onClick={onClose}>
          取消
        </Button>
        <Button color="primary" onClick={onConfirm}>
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
    listStyleTypeNone: {
      listStyleType: 'none',
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
    res += `新增${result.added}项，`;
  }
  if (result.updated > 0) {
    res += `更新${result.updated}项，`;
  }
  if (result.deleted > 0) {
    res += `删除${result.deleted}项，`;
  }
  return res.slice(0, -1);
};

let Accounts = (props) => {
  const classes = useStyles();
  const {
    drives,
    updateDrives,
    setGlobalSnackbarMessage,
    setOperationStatus,
  } = props;
  const [selected, setSelected] = useState([]);
  const [openAddDrive, setOpenAddDrive] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openFullUpdateDialog, setOpenFullUpdateDialog] = useState(false);

  const mediaUpSm = useMediaQuery((theme) => theme.breakpoints.up('sm'));

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

  const handleOperateDrives = (method, params, setOpenDialog) => {
    setOperationStatus(OPERATING_STATUS.RUNNING);
    if (setOpenDialog) setOpenDialog(false);
    setSelected([]);
    setGlobalSnackbarMessage('');

    const fetchData = async () => {
      let res = await apiRequest(method, {
        params: params,
        require_auth: true,
      });
      // 加 await 保证当前页面 drive 数据最新
      await updateDrives();
      setOperationStatus(OPERATING_STATUS.SUCCESS);
      setGlobalSnackbarMessage(resultToMessage(res.data.result));
    };

    fetchData().catch((e) => {
      setOperationStatus(OPERATING_STATUS.FAILED);
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
      { drive_ids: selected },
      setOpenDeleteDialog
    );
  };

  const handleFullUpdateDrives = () => {
    handleOperateDrives(
      'Onedrive.update',
      { drive_ids: selected, entire: true },
      setOpenFullUpdateDialog
    );
  };

  const handleUpdateDrives = () => {
    handleOperateDrives('Onedrive.update', { drive_ids: selected });
  };

  const iconButtons = [
    {
      name: 'update',
      text: '更新',
      onClick: handleUpdateDrives,
      Icon: UpdateIcon,
    },
    {
      name: 'fullupdate',
      text: '全量更新',
      onClick: () => setOpenFullUpdateDialog(true),
      Icon: AutorenewIcon,
    },
    {
      name: 'delete',
      text: '删除',
      onClick: () => setOpenDeleteDialog(true),
      Icon: DeleteIcon,
    },
  ];

  return (
    <Paper className={classes.root}>
      <MyToolbar>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setOpenAddDrive(true)}
        >
          添加帐号
        </Button>
      </MyToolbar>
      <SelectedToobar
        ToolbarComponent={MyToolbar}
        numSelected={selected.length}
        onCancel={() => setSelected([])}
        iconButtons={iconButtons}
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
                  container: classes.listStyleTypeNone,
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
                <ListItemSecondaryAction style={{ transform: 'unset' }}>
                  <Typography variant="body2" color="textSecondary">{`${bTokmg(
                    drive.quota.used
                  )} / ${bTokmg(drive.quota.total)}`}</Typography>
                </ListItemSecondaryAction>
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
      />
      <MessageDialog
        open={openFullUpdateDialog}
        title="全量更新"
        description="此操作会先删除大部分数据后再更新，操作时间较长"
        numSelected={selected.length}
        onClose={() => setOpenFullUpdateDialog(false)}
        onConfirm={handleFullUpdateDrives}
      />
    </Paper>
  );
};

Accounts.propTypes = {
  drives: PropTypes.array.isRequired,
  updateDrives: PropTypes.func.isRequired,
  setGlobalSnackbarMessage: PropTypes.func.isRequired,
  operationStatus: PropTypes.string,
  setOperationStatus: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    setGlobalSnackbarMessage: (message) =>
      dispatch(setGlobalSnackbarMessage(message)),
    setOperationStatus: (status) => dispatch(setOperationStatus(status)),
  };
};

Accounts = connect(null, mapDispatchToProps)(Accounts);

export default Accounts;
