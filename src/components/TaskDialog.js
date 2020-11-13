import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
import PathTextField from './PathTextField';
import apiRequest from '../api';
import { connect } from 'react-redux';
import { setGlobalSnackbarMessage } from '../actions';

const initPathes = {
  upload_path: '/',
  local_path: '/',
};

let TaskDialog = (props) => {
  const {
    open,
    onClose,
    drives,
    type,
    title,
    message,
    defaultLocalPath,
    setGlobalSnackbarMessage,
  } = props;
  const [pathes, setPathes] = useState(initPathes);
  const [drive, setDrive] = useState(drives[0]);

  React.useEffect(() => {
    if (defaultLocalPath) {
      setPathes((prev) => ({
        ...prev,
        local_path: defaultLocalPath,
      }));
    }
  }, [defaultLocalPath]);

  const handleSubmit = () => {
    if (drive) {
      let params = {
        drive_id: drive.id,
        upload_path: pathes.upload_path,
        local_path: pathes.local_path,
        type: type,
      };

      const fetchData = async () => {
        await apiRequest('Onedrive.upload', {
          params: params,
          require_auth: true,
        });
        handleClose();
        // setState(initState);
      };
      fetchData().catch((e) => {
        if (e.response) {
          setGlobalSnackbarMessage('文件或文件夹未找到');
        } else {
          setGlobalSnackbarMessage('网络错误');
        }
      });
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  const addPathChild = (name, item) => {
    let newPath = pathes[name] + item.value;
    if (item.type !== 'file') {
      newPath += '/';
    }
    setPathes({
      ...pathes,
      [name]: newPath,
    });
  };

  const goPathAncestry = (name, index) => {
    let newPath = pathes[name];
    let flag = false;
    if (newPath.startsWith('/')) {
      newPath = newPath.slice(1);
      flag = true;
    }
    newPath = (flag ? '/' : '') + newPath.split('/').slice(0, index).join('/');
    if (index !== 0) newPath += '/';
    setPathes({
      ...pathes,
      [name]: newPath,
    });
  };

  const handleChangeDrive = (e) => {
    setDrive(drives.find((item) => item.owner.user.email === e.target.value));
  };

  const handleReset = () => {
    let newPathes = initPathes;
    if (defaultLocalPath) {
      newPathes = {
        ...initPathes,
        local_path: defaultLocalPath,
      };
    }
    setPathes(newPathes);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
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
          name="upload_path"
          value={pathes.upload_path}
          addPathChild={addPathChild}
          goPathAncestry={goPathAncestry}
          method="listDrivePath"
          label="OneDrive 目录"
          drive={drive}
          type="folder"
        />
        <PathTextField
          name="local_path"
          value={pathes.local_path}
          addPathChild={addPathChild}
          goPathAncestry={goPathAncestry}
          method="listSysPath"
          label={type === 'file' ? '文件路径' : '文件夹路径'}
          type={type}
        ></PathTextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleReset} color="secondary">
          重置
        </Button>
        <Button onClick={handleClose} color="secondary">
          取消
        </Button>
        <Button onClick={handleSubmit} color="primary">
          提交
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TaskDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  drives: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  defaultLocalPath: PropTypes.string,
  setGlobalSnackbarMessage: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    setGlobalSnackbarMessage: (message) =>
      dispatch(setGlobalSnackbarMessage(message)),
  };
};

TaskDialog = connect(null, mapDispatchToProps)(TaskDialog);

export default TaskDialog;
