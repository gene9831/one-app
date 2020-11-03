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
import rpcRequest from '../jsonrpc';
import { connect } from 'react-redux';
import { setGlobalSnackbarMessage } from '../actions';

const default_path = '/';
const initState = {
  upload_path: '/',
  file_path: default_path,
  folder_path: default_path,
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
  const [pathes, setPathes] = useState(initState);
  const [clicked, setClicked] = useState(null);
  const [drive, setDrive] = useState(drives[0]);

  React.useEffect(() => {
    if (defaultLocalPath) {
      setPathes((prev) => ({
        ...prev,
        file_path: defaultLocalPath,
        folder_path: defaultLocalPath,
      }));
    }
  }, [defaultLocalPath]);

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
    let newPathes = initState;
    if (defaultLocalPath) {
      newPathes = {
        ...initState,
        file_path: defaultLocalPath,
        folder_path: defaultLocalPath,
      };
    }
    setPathes(newPathes);
  };

  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
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
    </React.Fragment>
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
