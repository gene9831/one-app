import React, { useState, useEffect } from 'react';
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
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { ListSubheader } from '@material-ui/core';
import ComponentShell from './ComponentShell';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  progress: {
    zIndex: theme.zIndex.drawer + 2,
    position: 'fixed',
    width: '100%',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
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
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  menuButton: {
    marginRight: theme.spacing(4),
  },
  hide: {
    display: 'none',
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
    padding: theme.spacing(3),
  },
  subTitle: {
    fontSize: '1rem',
  },
}));

// 默认主题
const initTheme = createMuiTheme({
  palette: {
    primary: { main: '#1976d2' },
  },
});

const initPalette = {
  type: initTheme.palette.type,
  primary: initTheme.palette.primary.main,
  secondary: initTheme.palette.secondary.main,
};

export default function MainDrawer(props) {
  const classes = useStyles();
  const { pageProps, endComponents, initOpenDrawer } = props;
  const { pageIndex, setPageIndex, pageSections } = pageProps;

  const [openDrawer, setOpenDrawer] = useState(initOpenDrawer);
  const [customTheme, setCustomTheme] = useState(initTheme);
  const [customPalette, setCustomPalette] = useState(initPalette);
  const [page, setPage] = useState({});

  useEffect(() => {
    setCustomTheme(
      createMuiTheme({
        palette: {
          type: customPalette.type,
          primary: { main: customPalette.primary },
          secondary: { main: customPalette.secondary },
        },
      })
    );
  }, [customPalette]);

  useEffect(() => {
    const section = pageSections[pageIndex.section];
    setPage({
      subHeader: section.subHeader,
      sectionName: section.name,
      ...section.items[pageIndex.item],
    });
  }, [pageIndex, pageSections]);

  return (
    <ThemeProvider theme={customTheme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: openDrawer,
          })}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() =>
                pageSections.length > 0 ? setOpenDrawer(true) : null
              }
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
              {page.subHeader}
              {page.text ? ' | ' : ''}
              <span className={classes.subTitle}>{page.text}</span>
            </Typography>
            <Palette
              customPalette={customPalette}
              setCustomPalette={setCustomPalette}
              initPalette={initPalette}
            />
            {endComponents}
          </Toolbar>
        </AppBar>
        {pageSections.length > 0 ? (
          <Drawer
            variant="permanent"
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
          >
            <div className={classes.toolbar}>
              <IconButton onClick={() => setOpenDrawer(false)}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <List>
              {pageSections.map((section, sectionIndex) => (
                <React.Fragment key={sectionIndex}>
                  <Divider />
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
                        setPageIndex({ section: sectionIndex, item: itemIndex })
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
        <Container className={classes.content}>
          <div className={classes.toolbar} />
          {props.children}
        </Container>
      </div>
    </ThemeProvider>
  );
}

MainDrawer.defaultProps = {
  initOpenDrawer: false,
};

MainDrawer.propTypes = {
  initOpenDrawer: PropTypes.bool,
  pageProps: PropTypes.shape({
    pageIndex: PropTypes.shape({
      section: PropTypes.number.isRequired,
      item: PropTypes.number.isRequired,
    }),
    setPageIndex: PropTypes.func.isRequired,
    pageSections: PropTypes.arrayOf(
      PropTypes.shape({
        subHeader: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        items: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
            Icon: PropTypes.any.isRequired,
          })
        ),
      })
    ),
  }),
  endComponents: PropTypes.any,
  children: PropTypes.any,
};
