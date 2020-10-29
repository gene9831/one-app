import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import rpcRequest from '../jsonrpc';
import cookies from '../cookies';
import Tooltip from '@material-ui/core/Tooltip';

export default function Exit(props) {
  const { setAuthed, setLogged } = props;
  const [openLogout, setOpenLogout] = useState(false);

  // Logout
  const handleClickLogout = () => {
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

  return (
    <React.Fragment>
      <Tooltip title="退出">
        <IconButton color="inherit" onClick={handleClickLogout}>
          <ExitToAppIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        fullWidth
        maxWidth="xs"
        open={openLogout}
        onClose={handleCancelLogout}
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

Exit.propTypes = {
  setAuthed: PropTypes.func.isRequired,
  setLogged: PropTypes.func.isRequired,
};
