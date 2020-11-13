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
import apiRequest from '../api';
import Tooltip from '@material-ui/core/Tooltip';
import { AUTH_STATUS, setAuth } from '../actions';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

let Exit = (props) => {
  const { token, setAuth, root } = props;
  const [openLogout, setOpenLogout] = useState(false);
  const history = useHistory();

  // Logout
  const handleClickLogout = () => {
    setOpenLogout(true);
  };
  const handleCancelLogout = () => {
    setOpenLogout(false);
  };
  const handleLogout = () => {
    const fetchData = async () => {
      await apiRequest('Admin.logout', {
        params: [token],
        require_auth: true,
      });
      setAuth({
        status: AUTH_STATUS.OUT,
      });
      history.push(`${root}/login`);
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
};

Exit.propTypes = {
  token: PropTypes.string,
  setAuth: PropTypes.func,
  root: PropTypes.string,
};

const mapStateToProps = (state) => ({
  token: state.auth.token,
});

const mapDispatchToProps = (dispatch) => {
  return {
    setAuth: (payload) => dispatch(setAuth(payload)),
  };
};

Exit = connect(mapStateToProps, mapDispatchToProps)(Exit);

export default Exit;
