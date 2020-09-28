import React, { useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { Container } from '@material-ui/core';
import BackupIcon from '@material-ui/icons/Backup';
import CloudDoneIcon from '@material-ui/icons/CloudDone';
import CloudOffIcon from '@material-ui/icons/CloudOff';
import UploadInfo from './UploadInfo';
import MultiUersAvatar from './MultiUersAvatar';
import Axios from 'axios';
import { OD_ADMIN_API } from '../App';
import Cookies from 'universal-cookie';
import PaletteIcon from '@material-ui/icons/Palette';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import PaletteDialog from './PaletteDialog';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import {
  amber,
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from '@material-ui/core/colors';

const colors = {
  amber: amber,
  blue: blue,
  blueGrey: blueGrey,
  brown: brown,
  cyan: cyan,
  deepOrange: deepOrange,
  deepPurple: deepPurple,
  green: green,
  grey: grey,
  indigo: indigo,
  lightBlue: lightBlue,
  lightGreen: lightGreen,
  lime: lime,
  orange: orange,
  pink: pink,
  purple: purple,
  red: red,
  teal: teal,
  yellow: yellow,
};

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
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
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
  pageTitle: {
    fontSize: '1rem',
  },
  colorBlock: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    margin: 'auto',
  },
  paperScrollPaper: {
    bottom: '10%',
    minWidth: '380px',
  },
  colorContainer: {
    '& >div': {
      textAlign: 'center',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  },
  selector: {
    maxHeight: '300px',
  },
}));

const cookies = new Cookies();
const pages = {
  running: { value: 'running', text: '上传中' },
  stopped: { value: 'stopped', text: '已暂停' },
  finished: { value: 'finished', text: '已完成' },
};

const defaultTheme = createMuiTheme({});

const createTheme = (palette) =>
  createMuiTheme({
    palette: palette,
  });

const initColor = {
  primary: 'indigo',
  secondary: 'pink',
  dark: false,
};
export default function MiniDrawer() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(true);
  const [drives, setDrives] = React.useState([]);
  const [selectedDrive, setSelectedDrive] = React.useState(null);
  const [page, setPage] = React.useState(pages.running);
  const [customTheme, setCustomTheme] = React.useState(defaultTheme);
  const [openPalette, setOpenPalette] = React.useState(false);
  const [customColor, setCustomColor] = React.useState(initColor);

  const updateDrives = async () => {
    let res = await Axios.post(
      OD_ADMIN_API,
      {
        jsonrpc: '2.0',
        method: 'Onedrive.getDrives',
        params: [],
        id: '1',
      },
      { headers: { 'X-Password': 'secret' } }
    );
    let result = res.data.result;
    setDrives(result);

    const cookieDrive = cookies.get('drive');
    if (cookieDrive && result.find((x) => x.id === cookieDrive.id)) {
      setSelectedDrive(cookieDrive);
    } else if (result.length > 0) {
      setSelectedDrive(result[0]);
      cookies.set('drive', JSON.stringify(result[0]), {
        path: '/',
        maxAge: 3600 * 24 * 30,
      });
    }
  };

  useEffect(() => {
    updateDrives();
  }, []);

  useEffect(() => {
    const palette = { primary: {}, secondary: {} };
    if (customColor.dark) palette.type = 'dark';
    palette.primary = colors[customColor.primary];
    palette.secondary = colors[customColor.secondary];
    setCustomTheme(createTheme(palette));
  }, [customColor]);

  useEffect(() => {
    if (selectedDrive) {
      const colorSchemeCookie = cookies.get('colorScheme') || {};
      const colorScheme = colorSchemeCookie[selectedDrive.id];
      if (colorScheme) {
        setCustomColor(colorScheme);
      } else {
        setCustomColor(initColor);
      }
    }
  }, [selectedDrive]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleClickPage = (page) => {
    setPage(page);
  };

  const handleClickPalette = () => {
    setOpenPalette(true);
  };

  const handleClosePalette = () => {
    setOpenPalette(false);
  };

  const handleChangeCustomColor = (e) => {
    const colorScheme = {
      ...customColor,
      [e.target.name]: e.target.value,
    };
    setCustomColor(colorScheme);
    setColorSchemeCookie(colorScheme);
  };

  const handleResetColor = () => {
    setCustomColor(initColor);
    setColorSchemeCookie(initColor);
  };

  const handleChangeBrightness = () => {
    const colorScheme = {
      ...customColor,
      dark: !customColor.dark,
    };
    setCustomColor(colorScheme);
    setColorSchemeCookie(colorScheme);
  };

  const setColorSchemeCookie = (colorScheme) => {
    if (selectedDrive) {
      const colorSchemeCookie = cookies.get('colorScheme') || {};
      cookies.set(
        'colorScheme',
        JSON.stringify({
          ...colorSchemeCookie,
          [selectedDrive.id]: colorScheme,
        }),
        {
          path: '/',
          maxAge: 3600 * 24 * 30,
        }
      );
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar
          position="fixed"
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleDrawerOpen}
              className={clsx(classes.menuButton, {
                [classes.hide]: open,
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
              上传管理 | <span className={classes.pageTitle}>{page.text}</span>
            </Typography>
            <IconButton color="inherit" onClick={handleClickPalette}>
              <PaletteIcon />
            </IconButton>
            <IconButton color="inherit" onClick={handleChangeBrightness}>
              {customColor.dark ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
            <PaletteDialog
              openPalette={openPalette}
              handleClosePalette={handleClosePalette}
              customColor={customColor}
              handleChangeCustomColor={handleChangeCustomColor}
              handleResetColor={handleResetColor}
              colors={colors}
            />
            <MultiUersAvatar
              drives={drives}
              drive={selectedDrive}
              setDrive={setSelectedDrive}
              updateDrives={updateDrives}
            />
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          className={clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
          classes={{
            paper: clsx({
              [classes.drawerOpen]: open,
              [classes.drawerClose]: !open,
            }),
          }}
        >
          <div className={classes.toolbar}>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'rtl' ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </div>
          <Divider />
          <List>
            <ListItem
              button
              selected={page === pages.running}
              onClick={() => handleClickPage(pages.running)}
            >
              <ListItemIcon>
                <BackupIcon></BackupIcon>
              </ListItemIcon>
              <ListItemText primary={pages.running.text} />
            </ListItem>
            <ListItem
              button
              selected={page === pages.stopped}
              onClick={() => handleClickPage(pages.stopped)}
            >
              <ListItemIcon>
                <CloudOffIcon></CloudOffIcon>
              </ListItemIcon>
              <ListItemText primary={pages.stopped.text} />
            </ListItem>
            <ListItem
              button
              selected={page === pages.finished}
              onClick={() => handleClickPage(pages.finished)}
            >
              <ListItemIcon>
                <CloudDoneIcon></CloudDoneIcon>
              </ListItemIcon>
              <ListItemText primary={pages.finished.text} />
            </ListItem>
          </List>
        </Drawer>
        <Container className={classes.content}>
          <div className={classes.toolbar} />
          <UploadInfo drive={selectedDrive} pageName={page.value}></UploadInfo>
        </Container>
      </div>
    </ThemeProvider>
  );
}
