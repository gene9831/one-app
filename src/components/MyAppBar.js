import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const useStyles = makeStyles(() => ({
  div: {
    flexGrow: 1,
  },
}));

let MyAppBar = (props) => {
  const { startComponents, endComponents, color, classes } = props;
  const styles = useStyles();

  return (
    <AppBar position="fixed" className={classes.appBar} color={color}>
      <Toolbar className={classes.toolbar}>
        {startComponents}
        <div className={styles.div}></div>
        {endComponents}
      </Toolbar>
    </AppBar>
  );
};

MyAppBar.propTypes = {
  startComponents: PropTypes.node,
  endComponents: PropTypes.node,
  color: PropTypes.string,
  classes: PropTypes.object,
};

MyAppBar.defaultProps = {
  classes: {},
};

MyAppBar = connect((state) => ({
  color: state.palette.type === 'dark' ? 'inherit' : 'primary',
}))(MyAppBar);

export default MyAppBar;
