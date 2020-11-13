import { Container, Typography, Box, makeStyles } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import MyAppBar from './MyAppBar';
import Palette from './Palette';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  link: {
    padding: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  404: {
    textAlign: 'center',
    padding: theme.spacing(2, 0),
  },
}));

const NoRoute = () => {
  const classes = useStyles();
  return (
    <Container>
      <MyAppBar title="404" endComponents={<Palette />} />
      <div className={classes.toolbar}></div>
      <Typography variant="h1" className={classes['404']}>
        404
      </Typography>
      <Box style={{ display: 'flex', justifyContent: 'center' }}>
        <Link to="/" className={classes.link}>
          Home
        </Link>
        <Link to="/admin" className={classes.link}>
          Admin
        </Link>
      </Box>
    </Container>
  );
};

export default NoRoute;
