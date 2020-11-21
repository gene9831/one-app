import { Container, makeStyles } from '@material-ui/core';
import React from 'react';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  container: {
    flexGrow: 1,
    overflow: 'auto',
  },
  toolbar: {
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
    },
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(1),
    },
  },
}));

const MyContainer = (props) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.toolbar}></div>
      <Container className={classes.content}>{props.children}</Container>
    </div>
  );
};

MyContainer.propTypes = {
  children: PropTypes.node,
};

export default MyContainer;
