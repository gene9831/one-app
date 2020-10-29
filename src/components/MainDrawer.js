import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import Drawer from '@material-ui/core/Drawer';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { useMediaQuery, useTheme } from '@material-ui/core';
import ComponentShell from './ComponentShell';
import cookies from '../cookies';
import MyAppBar from './MyAppBar';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => {
  const mediaUpSm = theme.breakpoints.up('sm');
  const mediaUpMd = theme.breakpoints.up('md');
  return {
    root: {
      display: 'flex',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    },
    drawerOpen: {
      width: drawerWidth - 20,
      [mediaUpMd]: {
        width: drawerWidth,
      },
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerClose: {
      [mediaUpMd]: {
        width: theme.spacing(9),
      },
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
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
      padding: theme.spacing(0),
      [mediaUpSm]: {
        padding: theme.spacing(3),
      },
      transition: theme.transitions.create(['padding'], {
        easing: theme.transitions.easing.sharp,
      }),
    },
    subTitle: {
      fontSize: '1rem',
    },
    container: {
      flexGrow: 1,
    },
  };
});

const initPageIndex = { section: 0, item: 0 };

export default function MainDrawer(props) {
  const classes = useStyles();
  const theme = useTheme();
  const { pageProps, showDrawer, endComponents } = props;
  const { defaultIndex, sections, views } = pageProps;

  const [openDrawer, setOpenDrawer] = useState(false);
  const [pageIndex, setPageIndex] = useState(initPageIndex);

  const upMd = useMediaQuery(theme.breakpoints.up('md'));
  const upLg = useMediaQuery(theme.breakpoints.up('lg'));

  useEffect(() => {
    const cookieIndex = cookies.get('index');
    if (cookieIndex) {
      setPageIndex(cookieIndex);
    } else if (defaultIndex) {
      setPageIndex(defaultIndex);
    }
  }, [defaultIndex]);

  useEffect(() => {
    // 保存页面位置
    if (pageIndex !== initPageIndex) {
      cookies.set('index', pageIndex, { maxAge: 3600 * 24 * 30 });
    }
  }, [pageIndex]);

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
    if (!upMd) {
      setOpenDrawer(false);
    }
  };

  useLayoutEffect(() => {
    setOpenDrawer(showDrawer && upLg);
  }, [showDrawer, upLg]);

  return (
    <div className={classes.root}>
      <MyAppBar
        shift={openDrawer}
        title={pageItem.text}
        onClickMenu={handleClickMenuIcon}
        endComponents={endComponents}
      />
      {showDrawer ? (
        <Drawer
          variant={upMd ? 'permanent' : 'temporary'}
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
      <div className={classes.container}>
        <div className={classes.toolbar} />
        <Container className={classes.content}>
          <ComponentShell Component={subComponent} Props={subComponentProps} />
        </Container>
      </div>
    </div>
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
