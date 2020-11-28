import {
  Chip,
  Collapse,
  fade,
  Grid,
  IconButton,
  InputBase,
  Link,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  MenuItem,
  Paper,
  styled,
  TextField,
  Tooltip,
  Typography,
} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import FilterListIcon from '@material-ui/icons/FilterList';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';

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
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    '& > *': {
      paddingRight: theme.spacing(2),
    },
    '& > *:last-child': {
      paddingRight: theme.spacing(0),
    },
  },
  filterOpen: {
    width: ({ filterWidth }) => filterWidth,
    flexShrink: 0,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  filterClose: {
    width: 0,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    paddingRight: theme.spacing(0),
  },
  gridContainer: {
    justifyContent: 'center',
    flexGrow: 1,
  },
  list: {
    '&> *': {
      borderRadius: theme.shape.borderRadius,
      whiteSpace: 'nowrap',
    },
  },
  sortSlector: {
    padding: theme.spacing(1, 2),
    whiteSpace: 'nowrap',
  },
  sortSlectorInput: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  genresDiv: {
    width: ({ filterWidth }) => filterWidth - theme.spacing(1),
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  genresChip: {
    margin: theme.spacing(0.5),
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

const orderList = [
  { text: '热门降序', order: { order: 'desc', orderBy: 'popularity' } },
  { text: '热门升序', order: { order: 'asc', orderBy: 'popularity' } },
  { text: '日期降序', order: { order: 'desc', orderBy: 'release_date' } },
  { text: '日期升序', order: { order: 'asc', orderBy: 'release_date' } },
  { text: '评分降序', order: { order: 'desc', orderBy: 'vote_average' } },
  { text: '评分升序', order: { order: 'asc', orderBy: 'vote_average' } },
];

const Movies = () => {
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
  const [filter, setFilter] = useState({
    sort: true,
    filter: true,
  });

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
            { overview: { $regex: value, $options: 'i' } },
          ],
        });
      } else {
        setSearch({});
      }
    }, 300);
  };

  const findSelectedGenre = (id) => {
    return selectedGenres.find((item) => item === id);
  };

  const handleClickGenre = (id) => {
    let newSelectedGenres = [];
    if (findSelectedGenre(id)) {
      newSelectedGenres = selectedGenres.filter((item) => item !== id);
    } else {
      newSelectedGenres = selectedGenres.concat(id);
    }
    setSelectedGenres(newSelectedGenres);
  };

  const clearSelectedGenres = () => {
    setSelectedGenres([]);
  };

  return (
    <>
      <MyAppBar
        startComponents={<TopButtons />}
        endComponents={[
          <div
            className={clsx(classes.search, classes.displayWhenMatchIsExact)}
            key="search"
          >
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
          <Tooltip
            key="filter"
            title="筛选"
            className={classes.displayWhenMatchIsExact}
          >
            <IconButton
              color={openFilter ? 'primary' : 'inherit'}
              onClick={() => setOpenFilter((prev) => !prev)}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>,
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
              <div
                className={clsx(classes.filter, {
                  [classes.filterOpen]: openFilter,
                  [classes.filterClose]: !openFilter,
                })}
              >
                <List className={classes.list}>
                  <ListItem
                    button
                    onClick={() =>
                      setFilter((prev) => ({
                        ...prev,
                        sort: !prev.sort,
                      }))
                    }
                  >
                    <ListItemText primary="排序"></ListItemText>
                    {filter.sort ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={filter.sort} timeout="auto" unmountOnExit>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={orderList[orderIndex].text}
                      className={classes.sortSlector}
                      select
                      SelectProps={{
                        MenuProps: {
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          getContentAnchorEl: null,
                        },
                        classes: {
                          root: classes.sortSlectorInput,
                        },
                      }}
                    >
                      {orderList.map((item, index) => (
                        <MenuItem
                          key={index}
                          value={item.text}
                          onClick={() => setOrderIndex(index)}
                        >
                          {item.text}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Collapse>
                  <ListItem
                    button
                    onClick={() =>
                      setFilter((prev) => ({
                        ...prev,
                        filter: !prev.filter,
                      }))
                    }
                  >
                    <ListItemText primary="筛选"></ListItemText>
                    {filter.filter ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={filter.filter}>
                    <div className={classes.genresDiv}>
                      {genres.map((item) => (
                        <Chip
                          label={item.name}
                          key={item.id}
                          variant="outlined"
                          color={
                            findSelectedGenre(item.id) ? 'primary' : 'default'
                          }
                          className={classes.genresChip}
                          onClick={() => handleClickGenre(item.id)}
                        />
                      ))}
                      <Chip
                        label="重置"
                        variant="outlined"
                        color="secondary"
                        className={classes.genresChip}
                        onClick={clearSelectedGenres}
                      />
                      <Chip
                        label="$or"
                        variant="outlined"
                        color={
                          genresLogical === '$or' ? 'primary' : 'secondary'
                        }
                        className={classes.genresChip}
                        onClick={() => setGenresLogical('$or')}
                      />
                      <Chip
                        label="$and"
                        variant="outlined"
                        color={
                          genresLogical === '$and' ? 'primary' : 'secondary'
                        }
                        className={classes.genresChip}
                        onClick={() => setGenresLogical('$and')}
                      />
                    </div>
                  </Collapse>
                </List>
              </div>
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
