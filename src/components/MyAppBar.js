import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import { connect } from 'react-redux';

const useStyles = makeStyles((theme) => {
  const mediaUpSm = theme.breakpoints.up('sm');
  const mediaUpMd = theme.breakpoints.up('md');

  return {
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      [mediaUpMd]: {
        marginLeft: (props) => props.shiftWidth,
        width: (props) => `calc(100% - ${props.shiftWidth}px)`,
      },
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: theme.spacing(0.5),
      [mediaUpSm]: {
        marginRight: theme.spacing(2),
      },
      [mediaUpMd]: {
        marginRight: theme.spacing(4),
      },
    },
    menuButtonHide: {
      [mediaUpMd]: {
        display: 'none',
      },
    },
    title: {
      flexGrow: 1,
    },
  };
});

let MyAppBar = (props) => {
  const { shift, title, onClickMenu, endComponents, color, startIcon } = props;
  const classes = useStyles(props);

  return (
    <AppBar
      position="fixed"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: shift,
      })}
      color={color}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onClickMenu}
          className={clsx(classes.menuButton, {
            [classes.menuButtonHide]: shift,
          })}
        >
          {startIcon}
        </IconButton>
        <Typography
          component="h1"
          variant="h6"
          color="inherit"
          noWrap
          className={classes.title}
        >
          {title}
        </Typography>
        {endComponents}
      </Toolbar>
    </AppBar>
  );
};

MyAppBar.propTypes = {
  shift: PropTypes.bool,
  shiftWidth: PropTypes.number,
  title: PropTypes.string,
  onClickMenu: PropTypes.func,
  endComponents: PropTypes.any,
  color: PropTypes.string,
  startIcon: PropTypes.node,
};

MyAppBar.defaultProps = {
  shiftWidth: 240,
  startIcon: <MenuIcon />,
};

MyAppBar = connect((state) => ({
  color: state.palette.type === 'dark' ? 'inherit' : 'primary',
}))(MyAppBar);

export default MyAppBar;
