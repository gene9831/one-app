import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, Typography, Box } from '@material-ui/core';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme) => ({
  root: {
    height: theme.spacing(2),
    borderRadius: 2,
  },
  text: {
    color: theme.palette.type === 'light' ? 'white' : 'black',
    ...(theme.palette.type === 'light' ? { textShadow: 'black 0 0 2px' } : {}),
  },
}));

const LinearProgressWithLabel = (props) => {
  const classes = useStyles();
  return (
    <Box position="relative">
      <LinearProgress className={classes.root} {...props} />
      <Box
        position="absolute"
        top={0}
        left={0}
        bottom={0}
        right={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography variant="body2" component="div" className={classes.text}>
          {`${props.value.toFixed(1)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

LinearProgressWithLabel.propTypes = {
  value: PropTypes.number.isRequired,
};

export default LinearProgressWithLabel;
