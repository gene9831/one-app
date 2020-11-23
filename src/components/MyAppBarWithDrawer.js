import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import clsx from 'clsx';
import MyAppBar from './MyAppBar';

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
  };
});

let MyAppBarWithDrawer = (props) => {
  const { shift, title, onClickMenu, endComponents, startIcon } = props;
  const classes = useStyles(props);

  return (
    <MyAppBar
      classes={{
        appBar: clsx(classes.appBar, {
          [classes.appBarShift]: shift,
        }),
      }}
      startComponents={[
        <IconButton
          key="button"
          edge="start"
          color="inherit"
          onClick={onClickMenu}
          className={clsx(classes.menuButton, {
            [classes.menuButtonHide]: shift,
          })}
        >
          {startIcon}
        </IconButton>,
        <Typography key="title" color="inherit" noWrap>
          {title}
        </Typography>,
      ]}
      endComponents={endComponents}
    />
  );
};

MyAppBarWithDrawer.propTypes = {
  shift: PropTypes.bool,
  shiftWidth: PropTypes.number,
  title: PropTypes.string,
  onClickMenu: PropTypes.func,
  endComponents: PropTypes.any,
  startIcon: PropTypes.node,
};

MyAppBarWithDrawer.defaultProps = {
  shiftWidth: 240,
  startIcon: <MenuIcon />,
};

export default MyAppBarWithDrawer;
