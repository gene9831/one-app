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
  file_path: default_path,
  folder_path: default_path,
};
export default function TaskDialog(props) {
  const classes = useStyles();
  // TODO 删除props中的drive
  const { open, setOpen, drive, drives, type, title, message } = props;
  const [state, setState] = useState(initState);
  const [snack, setSnack] = useState(false);
  const [clicked, setClicked] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);

  const handleSubmit = () => {
    if (selectedDrive) {
      let method;
      let params = {
        drive_id: selectedDrive.id,
        upload_path: state.upload_path,
      };
      if (type === 'file') {
        method = 'Onedrive.uploadFile';
        params.file_path = state.file_path;
      } else {
        method = 'Onedrive.uploadFolder';
        params.folder_path = state.folder_path;
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
    setState({
      ...state,
      [id]: value,
    });
  };

  const handleChangeDrive = (e) => {
    setSelectedDrive(
      drives.find((item) => item.owner.user.email === e.target.value)
    );
  };

  const handleReset = () => {
    setSelectedDrive(drive);
    setState(initState);
  };

  React.useEffect(() => {
    setSelectedDrive(drive);
  }, [drive]);

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
            value={selectedDrive ? selectedDrive.owner.user.email : ''}
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
            value={state.upload_path}
            setValue={setKeyValue}
            onlyDir={true}
            api="listDrivePath"
            label="OneDrive 目录"
            drive={selectedDrive}
            clicked={clicked}
            setClicked={setClicked}
          />
          {type === 'file' ? (
            <PathTextField
              id="file_path"
              value={state.file_path}
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
              value={state.folder_path}
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
  drive: PropTypes.object,
  drives: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
};
