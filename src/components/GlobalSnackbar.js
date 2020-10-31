import React from 'react';
import PropTypes from 'prop-types';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { setGlobalSnackbarMessage } from '../actions';

let GlobalSnackbar = ({ message, onClose }) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      open={message.length > 0}
      message={message}
      onClose={onClose}
      action={
        <Button color="secondary" size="small" onClick={onClose}>
          确认
        </Button>
      }
    />
  );
};

GlobalSnackbar.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

const mapStateToProps = (state) => ({
  message: state.globalSnackbarMessage,
});

const mapDispatchToProps = (dispatch) => {
  return {
    onClose: () => dispatch(setGlobalSnackbarMessage('')),
  };
};

GlobalSnackbar = connect(mapStateToProps, mapDispatchToProps)(GlobalSnackbar);

export default GlobalSnackbar;
