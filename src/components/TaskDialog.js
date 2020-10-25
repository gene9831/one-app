import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircleOutlinedIcon from '@material-ui/icons/AccountCircleOutlined';
import Snackbar from '@material-ui/core/Snackbar';
import PathTextField from './PathTextField';
import rpcRequest from '../jsonrpc';

const useStyles = makeStyles(() => ({
  paperScrollPaper: {
    bottom: '10%',
  },
}));

const default_path = '/';
const initState = {
  upload_path: '/',
  // TODO file_path和folder_path远程接受
  file_path: default_path,
  folder_path: default_path,
};
export default function TaskDialog(props) {
  const classes = useStyles();
  const { open, setOpen, drives, type, title, message } = props;
  const [pathes, setPathes] = useState(initState);
  const [snack, setSnack] = useState(false);
  const [clicked, setClicked] = useState(null);
  const [drive, setDrive] = useState(drives[0]);

  const handleSubmit = () => {
    if (drive) {
      let method;
      let params = {
        drive_id: drive.id,
        upload_path: pathes.upload_path,
      };
      if (type === 'file') {
        method = 'Onedrive.uploadFile';
        params.file_path = pathes.file_path;
      } else {
        method = 'Onedrive.uploadFolder';
        params.folder_path = pathes.folder_path;
      }

      const fetchData = async () => {
        await rpcRequest(method, { params: params, require_auth: true });
        handleClose();
        // setState(initState);
      };
      fetchData().catch(() => {
        setSnack(true);
      });
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const setKeyValue = (id, value) => {
    setPathes({
      ...pathes,
      [id]: value,
    });
  };

  const handleChangeDrive = (e) => {
    setDrive(drives.find((item) => item.owner.user.email === e.target.value));
  };

  const handleReset = () => {
    setPathes(initState);
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        classes={{
          paperScrollPaper: classes.paperScrollPaper,
        }}
        onClick={() => setClicked(null)}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
          <TextField
            margin="dense"
            id="onedrive-email"
            label="OneDrive 邮箱"
            value={drive ? drive.owner.user.email : ''}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleOutlinedIcon />
                </InputAdornment>
              ),
            }}
            onChange={handleChangeDrive}
            select
            SelectProps={{
              MenuProps: {
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                getContentAnchorEl: null,
              },
            }}
            onFocus={() => setClicked(null)}
          >
            {drives.map((option) => (
              <MenuItem
                key={option.owner.user.email}
                value={option.owner.user.email}
              >
                {option.owner.user.email}
              </MenuItem>
            ))}
          </TextField>
          <PathTextField
            id="upload_path"
            value={pathes.upload_path}
            setValue={setKeyValue}
            onlyDir={true}
            api="listDrivePath"
            label="OneDrive 目录"
            drive={drive}
            clicked={clicked}
            setClicked={setClicked}
          />
          {type === 'file' ? (
            <PathTextField
              id="file_path"
              value={pathes.file_path}
              setValue={setKeyValue}
              onlyDir={false}
              api="listSysPath"
              label="文件路径"
              clicked={clicked}
              setClicked={setClicked}
            ></PathTextField>
          ) : (
            <PathTextField
              id="folder_path"
              value={pathes.folder_path}
              setValue={setKeyValue}
              onlyDir={true}
              api="listSysPath"
              label="文件夹路径"
              clicked={clicked}
              setClicked={setClicked}
            ></PathTextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReset} color="primary">
            重置
          </Button>
          <Button onClick={handleClose} color="primary">
            取消
          </Button>
          <Button onClick={handleSubmit} color="secondary">
            提交
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={snack}
        onClose={() => setSnack(false)}
        message="文件或文件夹未找到"
      ></Snackbar>
    </React.Fragment>
  );
}

TaskDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  drives: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};
