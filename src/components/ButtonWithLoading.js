import { Button, CircularProgress, makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
  button: {
    position: 'relative',
  },
  progresssize: {
    width: (props) => props.progresssize,
    height: (props) => props.progresssize,
  },
  div: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
}));

const ButtonWithLoading = (props) => {
  const classes = useStyles(props);
  const { loading, progresssize } = props;
  return (
    <Button
      {...props}
      loading={undefined}
      progresssize={undefined}
      disabled={loading}
      className={classes.button}
    >
      {props.children}
      {loading ? (
        <div className={clsx(classes.div, classes.progresssize)}>
          <CircularProgress
            style={{ width: progresssize, height: progresssize }}
          />
        </div>
      ) : null}
    </Button>
  );
};

ButtonWithLoading.propTypes = {
  loading: PropTypes.bool,
  progresssize: PropTypes.number.isRequired,
  children: PropTypes.node,
};

ButtonWithLoading.defaultProps = {
  progresssize: 32,
};

export default ButtonWithLoading;
