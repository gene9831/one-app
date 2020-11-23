import { Typography, Box, makeStyles, Button } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import MyAppBar from './MyAppBar';
import MyContainer from './MyContainer';
import Palette from './Palette';
import InfoIcon from '@material-ui/icons/Info';

const useStyles = makeStyles((theme) => ({
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
    <React.Fragment>
      <MyAppBar
        startComponents={
          <Button color="inherit" startIcon={<InfoIcon />}>
            <Typography>404</Typography>
          </Button>
        }
        endComponents={<Palette />}
      />
      <MyContainer>
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
      </MyContainer>
    </React.Fragment>
  );
};

export default NoRoute;
