import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import clsx from 'clsx';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Container from '@material-ui/core/Container';
import Palette from './Palette';
import Drawer from '@material-ui/core/Drawer';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { useTheme } from '@material-ui/core';
import ComponentShell from './ComponentShell';
import useWindowSize from '../hooks/useWindowSize';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    [theme.breakpoints.up('md')]: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
    },
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth - 20,
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
    },
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    width: theme.spacing(9),
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      marginRight: theme.spacing(4),
    },
  },
  hide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  title: {
    flexGrow: 1,
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(0),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3),
    },
  },
  subTitle: {
    fontSize: '1rem',
  },
  divContainer: {
    width: '100%',
  },
}));

const defaultPalettes = {
  light: {
    type: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
    success: { main: '#4caf50' },
  },
  dark: {
    type: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    info: { main: '#2196f3' },
    success: { main: '#4caf50' },
  },
};

const initPalette = { type: 'light' };

export default function MainDrawer(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { pageProps, showDrawer, endComponents } = props;
  const { defaultIndex, sections, views } = pageProps;

  const [openDrawer, setOpenDrawer] = useState(false);
  const [windowWidth] = useWindowSize();

  const [customPalette, setCustomPalette] = useState(initPalette);
  const customTheme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          ...defaultPalettes[customPalette.type],
          ...customPalette,
        },
      }),
    [customPalette]
  );

  const [pageIndex, setPageIndex] = useState({ section: 0, item: 0 });
  useEffect(() => {
    // pageIndex 默认值: { section: 0, item: 0 }
    if (defaultIndex) setPageIndex(defaultIndex);
  }, [defaultIndex]);

  const pageSection = useMemo(
    () => (sections ? sections[pageIndex.section] : null),
    [pageIndex.section, sections]
  );

  const pageItem = useMemo(
    () => (pageSection ? pageSection.items[pageIndex.item] : null),
    [pageIndex.item, pageSection]
  );

  const subComponent = useMemo(
    () =>
      sections
        ? views[pageIndex.section].Component ||
          views[pageIndex.section].items[pageIndex.item].Component
        : null,
    [pageIndex, sections, views]
  );

  const subComponentProps = useMemo(() => {
    if (!sections) return null;
    const sectionProps = { ...views[pageIndex.section].props };
    const itemProps = {
      ...((views[pageIndex.section].items || {})[pageIndex.item] || {}).props,
    };
    return { name: pageItem.name, ...sectionProps, ...itemProps };
  }, [pageIndex, pageItem.name, sections, views]);

  const drawerVariant = useMemo(
    () =>
      windowWidth >= theme.breakpoints.values.md ? 'permanent' : 'temporary',
    [theme.breakpoints.values.md, windowWidth]
  );

  const handleClickMenuIcon = () => {
    if (showDrawer) {
      setOpenDrawer(true);
    }
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

  const handleClickPageItem = (indexObj) => {
    setPageIndex(indexObj);
    if (drawerVariant === 'temporary') {
      setOpenDrawer(false);
    }
  };

  useLayoutEffect(() => {
    // window innerWidth 大于或等于lg断点值时打开Drawer
    // 基本上只在初始化运行一次
    setOpenDrawer(
      showDrawer && window.innerWidth >= theme.breakpoints.values.lg
    );
  }, [showDrawer, theme.breakpoints.values.lg]);

  return (
    <ThemeProvider theme={customTheme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: openDrawer,
          })}
          color={customPalette.type === 'light' ? 'primary' : 'inherit'}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={handleClickMenuIcon}
              className={clsx(classes.menuButton, {
                [classes.hide]: openDrawer,
              })}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              {pageSection.subHeader}
              {pageItem.text ? (
                <React.Fragment>
                  {' | '}
                  <span className={classes.subTitle}>{pageItem.text}</span>
                </React.Fragment>
              ) : null}
            </Typography>
            <Palette palette={customPalette} setPalette={setCustomPalette} />
            {endComponents}
          </Toolbar>
        </AppBar>
        {showDrawer ? (
          <Drawer
            variant={drawerVariant}
            className={clsx(classes.drawer, {
              [classes.drawerOpen]: openDrawer,
              [classes.drawerClose]: !openDrawer,
            })}
            classes={{
              paper: clsx({
                [classes.drawerOpen]: openDrawer,
                [classes.drawerClose]: !openDrawer,
              }),
            }}
            open={openDrawer}
            onClose={handleCloseDrawer}
          >
            <div className={classes.toolbar}>
              <IconButton onClick={handleCloseDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <List>
              {sections.map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  <ListSubheader>{section.subHeader}</ListSubheader>
                  {section.items.map((item, itemIndex) => (
                    <ListItem
                      button
                      key={itemIndex}
                      selected={
                        pageIndex.section === sectionIndex &&
                        pageIndex.item === itemIndex
                      }
                      onClick={() =>
                        handleClickPageItem({
                          section: sectionIndex,
                          item: itemIndex,
                        })
                      }
                    >
                      <ListItemIcon>
                        <ComponentShell Component={item.Icon} />
                      </ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </React.Fragment>
              ))}
            </List>
          </Drawer>
        ) : null}
        <div className={classes.divContainer}>
          <div className={classes.toolbar} />
          <Container className={classes.content}>
            <ComponentShell
              Component={subComponent}
              Props={subComponentProps}
            />
          </Container>
        </div>
      </div>
    </ThemeProvider>
  );
}

MainDrawer.propTypes = {
  pageProps: PropTypes.shape({
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        subHeader: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        items: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            text: PropTypes.string,
            Icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
          })
        ),
      })
    ),
    views: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        Component: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
        props: PropTypes.object,
        items: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            Component: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
            props: PropTypes.object,
          })
        ),
      })
    ),
    defaultIndex: PropTypes.shape({
      section: PropTypes.number.isRequired,
      item: PropTypes.number.isRequired,
    }),
  }),
  showDrawer: PropTypes.bool.isRequired,
  endComponents: PropTypes.any,
};

MainDrawer.defaultProps = {
  pageProps: {},
  showDrawer: true,
};
