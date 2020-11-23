import { Button, makeStyles } from '@material-ui/core';
import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  root: {
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
}));

const links = [
  { text: '文件列表', link: '/' },
  { text: '电影', link: '/movies' },
];

const TopButtons = () => {
  const classes = useStyles();
  const match = useRouteMatch();

  return (
    <div className={classes.root}>
      {links.map((item, index) => {
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
      })}
    </div>
  );
};

export default TopButtons;
