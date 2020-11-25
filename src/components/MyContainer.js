import { Container, makeStyles } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

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
  const { onScrollToBottom } = props;
  const classes = useStyles();
  const [onBottom, setOnBottom] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (onBottom) {
      onScrollToBottom();
    }
  }, [onBottom, onScrollToBottom]);

  useEffect(() => {
    // location变化时，也要将onBottom置为false
    setOnBottom(false);
  }, [location]);

  const handleScroll = useCallback((e) => {
    const rect = e.target.body.getBoundingClientRect();
    setOnBottom(rect.bottom < window.innerHeight + 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('sroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className={classes.container}>
      <div className={classes.toolbar}></div>
      <Container className={classes.content}>{props.children}</Container>
    </div>
  );
};

MyContainer.propTypes = {
  children: PropTypes.node,
  onScrollToBottom: PropTypes.func,
};

MyContainer.defaultProps = {
  onScrollToBottom: () => {},
};

export default MyContainer;
