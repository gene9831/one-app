import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3, 0),
  },
}));

export default function Accounts(props) {
  const { drives } = props;
  const classes = useStyles();

  return (
    <Grid container className={classes.root}>
      <Typography variant="h5" color="primary">
        OneDrive 帐号管理
      </Typography>
    </Grid>
  );
}

Accounts.propTypes = {
  drives: PropTypes.array.isRequired,
};
