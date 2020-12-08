import {
  Button,
  fade,
  Grid,
  IconButton,
  InputBase,
  makeStyles,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import MyContainer from './MyContainer';
import apiRequest from '../api';
import Movie from './Movie';
import MyAppBar from './MyAppBar';
import TopLeftButtons from './TopLeftButtons';
import SearchIcon from '@material-ui/icons/Search';
import { RobotDeadOutline } from './Icons';
import MovieCard from './MovieCard';
import FilterListIcon from '@material-ui/icons/FilterList';
import clsx from 'clsx';
import TopRightButtons from './TopRightButtons';
import MovieFilter from './MovieFilter';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { PALETTET_YPES } from '../actions';
import { isMobile } from '../utils';

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
  movieItem: { width: ({ cardWidth }) => cardWidth },
  movieTitle: {
    marginTop: theme.spacing(0.5),
    textAlign: 'center',
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
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  gridContainer: {
    justifyContent: 'center',
    flexGrow: 1,
  },
  displayWhenMatchIsExact: {
    display: ({ matchIsExact }) => (matchIsExact ? null : 'none'),
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    margin: theme.spacing(0, 2),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
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
      width: '15ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const numLimit = 28;

const orderList = [
  { text: '日期降序', order: { order: 'desc', orderBy: 'release_date' } },
  { text: '日期升序', order: { order: 'asc', orderBy: 'release_date' } },
];

let Movies = ({ paletteType }) => {
  const match = useRouteMatch();
  const history = useHistory();

  const classes = useStyles({
    cardWidth: 150,
    matchIsExact: match.isExact,
    filterWidth: 200,
  });

  const [movieData, setMovieData] = useState({
    count: 0,
    list: [],
  });

  const [openFilter, setOpenFilter] = useState(false);

  const [orderIndex, setOrderIndex] = useState(0);
  const order = useMemo(() => orderList[orderIndex].order, [orderIndex]);

  const [search, setSearch] = useState({});
  const [keyword, setKeyword] = useState('');

  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genresLogical, setGenresLogical] = useState('$or');

  useEffect(() => {
    const fetchData = async () => {
      let res = await apiRequest('TMDb.getMovies', {
        params: {
          match: {
            $and: [
              search,
              selectedGenres.length > 0
                ? {
                    [genresLogical]: selectedGenres.map((id) => ({
                      'genres.id': id,
                    })),
                  }
                : {},
            ],
          },
          limit: numLimit,
          order: order.order,
          order_by: order.orderBy,
        },
      });
      setMovieData(res.data.result);
    };
    fetchData();
  }, [genresLogical, order, search, selectedGenres]);

  useEffect(() => {
    if (genres.length === 0) {
      const fetchData = async () => {
        let res = await apiRequest('TMDb.getMovieGenres');
        setGenres(res.data.result);
      };
      fetchData();
    }
  }, [genres]);

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
            match: {
              $and: [
                search,
                selectedGenres.length > 0
                  ? {
                      [genresLogical]: selectedGenres.map((id) => ({
                        'genres.id': id,
                      })),
                    }
                  : {},
              ],
            },
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
        setSearch({
          $or: [
            { title: { $regex: value, $options: 'i' } },
            { original_title: { $regex: value, $options: 'i' } },
            { 'production_companies.name': { $regex: value, $options: 'i' } },
            { 'directors.name': { $regex: value, $options: 'i' } },
            { 'directors.also_known_as': { $regex: value, $options: 'i' } },
          ],
        });
      } else {
        setSearch({});
      }
    }, 300);
  };

  return (
    <>
      <MyAppBar
        startComponents={<TopLeftButtons />}
        endComponents={[
          <div
            className={clsx(classes.search, classes.displayWhenMatchIsExact)}
            key="search"
          >
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="电影、导演..."
              value={keyword}
              onChange={handleChangeKeyword}
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
            />
          </div>,
          <Tooltip
            key="filter"
            title="筛选"
            className={classes.displayWhenMatchIsExact}
          >
            <IconButton
              color={
                openFilter && paletteType === PALETTET_YPES.DARK
                  ? 'primary'
                  : 'inherit'
              }
              onClick={() => setOpenFilter((prev) => !prev)}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>,
          <TopRightButtons key="rightButtons" />,
        ]}
      />
      <MyContainer onScrollToBottom={handleScrollToBottom}>
        <Switch>
          <Route path={`${match.path}/:movieId`}>
            <Movie />
          </Route>
          <Route path={match.path}>
            <Paper className={classes.paper}>
              <MovieFilter
                open={openFilter}
                orderList={orderList}
                orderIndex={orderIndex}
                setOrderIndex={setOrderIndex}
                genres={genres}
                selectedGenres={selectedGenres}
                setSelectedGenres={setSelectedGenres}
                genresLogical={genresLogical}
                setGenresLogical={setGenresLogical}
              />
              <Grid container spacing={2} className={classes.gridContainer}>
                {movieData.list.map((movie) => (
                  <Grid item key={movie.id}>
                    <div className={classes.movieItem}>
                      <MovieCard
                        classes={classes}
                        movie={movie}
                        onClick={() =>
                          history.push(`${match.path}/${movie.id}`)
                        }
                      />
                      {isMobile ? (
                        <Typography className={classes.movieTitle}>
                          {`${movie.title} `}
                        </Typography>
                      ) : null}
                    </div>
                  </Grid>
                ))}
                {movieData.list.length < movieData.count ? (
                  <Grid item xs={12} style={{ textAlign: 'center' }}>
                    <Button
                      onClick={handleScrollToBottom}
                      variant="outlined"
                      color="primary"
                      style={{ width: 300 }}
                    >
                      加载更多
                    </Button>
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

Movies = connect((state) => ({
  paletteType: state.palette.type,
}))(Movies);

Movies.propTypes = {
  paletteType: PropTypes.string,
};

export default Movies;
