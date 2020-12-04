import {
  Button,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import React, { useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import clsx from 'clsx';
import MenuIcon from '@material-ui/icons/Menu';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import MovieIcon from '@material-ui/icons/Movie';

const useStyles = makeStyles((theme) => ({
  root: {
    whiteSpace: 'nowrap',
    '& > a:hover': {
      textDecoration: 'none',
    },
  },
  current: {
    color:
      theme.palette.type === 'light' ? 'inherit' : theme.palette.primary.main,
  },
  others: {
    color: 'inherit',
  },
  list: {
    width: 240,
  },
  oneAppTitle: {
    minHeight: theme.mixins.toolbar.minHeight - theme.spacing(1),
  },
}));

const links = [
  { text: '文件列表', link: '/', Icon: <FormatListBulletedIcon /> },
  { text: '电影', link: '/movies', Icon: <MovieIcon /> },
];

const TopLeftButtons = () => {
  const classes = useStyles();
  const match = useRouteMatch();
  const history = useHistory();
  const [openDrawer, setOpenDrawer] = useState(false);
  const downXs = useMediaQuery((theme) => theme.breakpoints.down('xs'));

  const handleClickLink = (link) => {
    if (history.location.pathname !== link) {
      setOpenDrawer(false);
      history.push(link);
    }
  };

  return (
    <div className={classes.root}>
      {downXs ? (
        <>
          <IconButton color="inherit" onClick={() => setOpenDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Drawer
            open={openDrawer}
            anchor="left"
            onClose={() => setOpenDrawer(false)}
          >
            <List className={classes.list}>
              <ListItem className={classes.oneAppTitle}>
                <Link href="https://github.com/gene9831/one-app">
                  <Typography>One App</Typography>
                </Link>
              </ListItem>
              <Divider />
              {links.map((item, index) => {
                const isCurrent = item.link === match.path;
                return (
                  <ListItem
                    button
                    key={index}
                    selected={isCurrent}
                    onClick={() => handleClickLink(item.link)}
                  >
                    <ListItemIcon>{item.Icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                );
              })}
            </List>
          </Drawer>
        </>
      ) : (
        links.map((item, index) => {
          const isCurrent = item.link === match.path;
          return (
            <Button
              key={index}
              size="large"
              href={item.link}
              className={clsx({
                [classes.current]: isCurrent,
                [classes.others]: !isCurrent,
              })}
            >
              {item.text}
            </Button>
          );
        })
      )}
    </div>
  );
};

export default TopLeftButtons;
