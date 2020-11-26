import {
  fade,
  Grid,
  IconButton,
  InputBase,
  Link,
  makeStyles,
  Paper,
  styled,
  Tooltip,
  Typography,
} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import React, { useEffect, useRef, useState } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import MyContainer from './MyContainer';
import Palette from './Palette';
import apiRequest from '../api';
import Movie from './Movie';
import MyAppBar from './MyAppBar';
import TopButtons from './TopButtons';
import SearchIcon from '@material-ui/icons/Search';
import { RobotDeadOutline } from './Icons';
import MovieCard, { LoadMoreCard } from './MovieCard';

const useStyles = makeStyles((theme) => ({
  actionArea: {
    borderRadius: theme.shape.borderRadius,
    transition: '0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  loadMore: {
    borderRadius: theme.shape.borderRadius,
  },
  card: ({ cardWidth }) => ({
    width: cardWidth,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.5)',
    },
  }),
  media: {
    width: '100%',
    height: 0,
    paddingBottom: '150%',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    position: 'relative',
  },
  content: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderRadius: theme.spacing(0, 0, 0.5, 0.5),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: theme.spacing(0.5, 1),
    transition: theme.transitions.create('transform'),
  },
  contentUp: {
    transform: 'translate(0, 0)',
  },
  contentDown: {
    transform: 'translate(0, 100%)',
  },
  title: {
    color: '#fff',
    textTransform: 'uppercase',
  },
  paper: { padding: theme.spacing(2) },
  gridContainer: { justifyContent: 'center' },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    marginRight: theme.spacing(2),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const numLimit = 25;

const Movies = () => {
  const match = useRouteMatch();
  const history = useHistory();

  const classes = useStyles({ cardWidth: 150 });

  const [movieData, setMovieData] = useState({
    count: 0,
    list: [],
  });

  // TODO 筛选与排序
  // eslint-disable-next-line no-unused-vars
  const [order, setOrder] = useState({
    order: 'desc',
    orderBy: 'release_date',
  });

  const [query, setQuery] = useState({});

  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      let res = await apiRequest('TMDb.getMovies', {
        params: {
          match: query,
          limit: numLimit,
          order: order.order,
          order_by: order.orderBy,
        },
      });
      setMovieData(res.data.result);
    };
    fetchData();
  }, [order, query]);

  const isBusy = useRef(false);

  const handleScrollToBottom = () => {
    if (
      match.isExact &&
      movieData.list.length < movieData.count &&
      !isBusy.current
    ) {
      isBusy.current = true;
      const fetchData = async () => {
        let res = await apiRequest('TMDb.getMovies', {
          params: {
            skip: movieData.list.length,
            limit: numLimit,
            order: order.order,
            order_by: order.orderBy,
          },
        });
        setMovieData((prev) => ({
          count: res.data.result.count,
          list: prev.list.concat(res.data.result.list),
        }));
      };
      fetchData()
        .catch(() => {})
        .finally(() => {
          isBusy.current = false;
        });
    }
  };

  const searchTimer = useRef(null);
  const handleChangeKeyword = (e) => {
    const value = e.target.value;
    setKeyword(value);
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    searchTimer.current = setTimeout(() => {
      if (value) {
        setQuery({
          $or: [
            { title: { $regex: value, $options: 'i' } },
            { original_title: { $regex: value, $options: 'i' } },
            { overview: { $regex: value, $options: 'i' } },
          ],
        });
      } else {
        setQuery({});
      }
    }, 300);
  };

  return (
    <>
      <MyAppBar
        startComponents={<TopButtons />}
        endComponents={[
          <div className={classes.search} key="search">
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="搜索"
              value={keyword}
              onChange={handleChangeKeyword}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>,
          <Palette key="palette" />,
          <Tooltip key="supervisor" title="后台管理">
            <IconButton
              component={styled(Link)(() => ({ color: 'inherit' }))}
              href="/admin"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>,
        ]}
      />
      <MyContainer onScrollToBottom={handleScrollToBottom}>
        <Switch>
          <Route path={`${match.path}/:movieId`}>
            <Movie />
          </Route>
          <Route path={match.path}>
            <Paper className={classes.paper}>
              <Grid container spacing={2} className={classes.gridContainer}>
                {movieData.list.map((movie) => (
                  <Grid item key={movie.id}>
                    <MovieCard
                      classes={classes}
                      movie={movie}
                      onClick={() => history.push(`${match.path}/${movie.id}`)}
                    />
                  </Grid>
                ))}
                {movieData.list.length < movieData.count ? (
                  <Grid item>
                    <LoadMoreCard
                      classes={classes}
                      onClick={handleScrollToBottom}
                    />
                  </Grid>
                ) : null}
                {movieData.count === 0 ? (
                  <Grid
                    item
                    xs={12}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ padding: 8 }}>
                      <RobotDeadOutline />
                    </span>
                    <Typography>什么都没有哦</Typography>
                  </Grid>
                ) : null}
              </Grid>
            </Paper>
          </Route>
        </Switch>
      </MyContainer>
    </>
  );
};

export default Movies;
