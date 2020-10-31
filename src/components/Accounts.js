import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { lighten, fade, makeStyles, styled } from '@material-ui/core/styles';
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
import CircularProgress from '@material-ui/core/CircularProgress';
import AddDriveDialog from './AddDriveDialog';
import Paper from '@material-ui/core/Paper';
import rpcRequest from '../jsonrpc';
import Container from '@material-ui/core/Container';

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
  const { numSelected, onDeleteSelected, onCancelSelected } = props;
  return (
    <Fade in={numSelected > 0}>
      <MyToolbar className={classes.selectedToolbar}>
        <Tooltip title="取消">
          <IconButton color="inherit" onClick={onCancelSelected}>
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
        <Tooltip title="删除">
          <IconButton onClick={onDeleteSelected} color="inherit">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </MyToolbar>
    </Fade>
  );
};

SelectedTooBar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onDeleteSelected: PropTypes.func,
  onCancelSelected: PropTypes.func,
};

const useDeleteDialogStyles = makeStyles((theme) => ({
  numSelected: {
    color: theme.palette.primary.main,
  },
  progress: {
    margin: theme.spacing(1, 0),
    display: 'flex',
    justifyContent: 'center',
  },
}));

const DeleteDialog = (props) => {
  const classes = useDeleteDialogStyles();
  const { open, numSelected, comfirming, onConfirm, onClose } = props;
  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
      <DialogTitle>移除 OneDrive 帐号</DialogTitle>
      <DialogContent>
        <DialogContentText>
          确定移除 <b className={classes.numSelected}>{numSelected}</b> 个
          OneDrive 帐号吗？
        </DialogContentText>
        <div className={classes.progress}>
          {comfirming ? <CircularProgress color="secondary" /> : null}
        </div>
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

DeleteDialog.propTypes = {
  open: PropTypes.bool,
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
  };
});

export default function Accounts(props) {
  const classes = useStyles();
  const { drives, updateDrives } = props;
  const [selected, setSelected] = useState([]);
  const [openAddDrive, setOpenAddDrive] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);

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

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleRemoveDrives = () => {
    setDeleteConfirming(true);

    const fetchData = async () => {
      await rpcRequest('Onedrive.signOut', {
        params: [selected],
        require_auth: true,
      });
      // 加 await 保证当前页面 drive 数据最新
      await updateDrives();
      setDeleteConfirming(false);
      setOpenDeleteDialog(false);
      setSelected([]);
    };

    fetchData().catch(() => {
      setDeleteConfirming(false);
    });
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
        </MyToolbar>
        <SelectedTooBar
          numSelected={selected.length}
          onDeleteSelected={() => setOpenDeleteDialog(true)}
          onCancelSelected={() => setSelected([])}
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
                  <ListItemAvatar onClick={() => handleClick(drive.id)}>
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
        <DeleteDialog
          open={openDeleteDialog}
          numSelected={selected.length}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleRemoveDrives}
          comfirming={deleteConfirming}
        />
      </Paper>
    </Container>
  );
}

Accounts.propTypes = {
  drives: PropTypes.array.isRequired,
  updateDrives: PropTypes.func.isRequired,
};
