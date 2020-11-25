import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Grid,
  IconButton,
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
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Movie from './Movie';
import MyAppBar from './MyAppBar';
import TopButtons from './TopButtons';
import RefreshIcon from '@material-ui/icons/Refresh';

const useStyles = makeStyles((theme) => ({
  actionArea: {
    borderRadius: theme.spacing(0.5),
    transition: '0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  loadMore: {
    borderRadius: theme.spacing(0.5),
  },
  card: ({ cardWidth }) => ({
    width: cardWidth,
    borderRadius: theme.spacing(0.5),
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
  paper: { padding: 16 },
  gridContainer: { justifyContent: 'center' },
}));

const MovieCard = ({ classes, movie, ...others }) => {
  const [hover, setHover] = useState(false);

  return (
    <CardActionArea
      className={classes.actionArea}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...others}
    >
      <Card className={classes.card}>
        <CardMedia
          image={`${tmdbImageUrl}/w200${movie.poster}`}
          className={classes.media}
        >
          <Box
            className={clsx(classes.content, {
              [classes.contentUp]: hover,
              [classes.contentDown]: !hover,
            })}
          >
            <Typography className={classes.title} variant="body2">
              {`${movie.title} (${movie.release_date.slice(0, 4)})`}
            </Typography>
          </Box>
        </CardMedia>
      </Card>
    </CardActionArea>
  );
};

MovieCard.propTypes = {
  classes: PropTypes.object,
  movie: PropTypes.object,
};

const LoadMoreCard = ({ classes, ...others }) => {
  return (
    <CardActionArea className={classes.loadMore} {...others}>
      <Card className={classes.card}>
        <CardMedia className={classes.media}>
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <RefreshIcon color="disabled" />
            <Typography color="textSecondary">加载更多</Typography>
          </div>
        </CardMedia>
      </Card>
    </CardActionArea>
  );
};

LoadMoreCard.propTypes = {
  classes: PropTypes.object,
};

const tmdbImageUrl = 'https://image.tmdb.org/t/p';
const numLimit = 25;

const Movies = () => {
  const match = useRouteMatch();
  const history = useHistory();

  const classes = useStyles({ cardWidth: 150 });

  const [movieData, setMovieData] = useState({
    count: 0,
    list: [],
  });

  const [order, setOrder] = useState({
    order: 'desc',
    orderBy: 'release_date',
  });

  useEffect(() => {
    const fetchData = async () => {
      let res = await apiRequest('TMDb.getMovies', {
        params: {
          limit: numLimit,
          order: order.order,
          order_by: order.orderBy,
        },
      });
      setMovieData(res.data.result);
    };
    fetchData();
  }, [order]);

  const isBusy = useRef(false);

  const handleScrollToBottom = () => {
    if (movieData.list.length < movieData.count && !isBusy.current) {
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

  return (
    <>
      <MyAppBar
        startComponents={<TopButtons />}
        endComponents={[
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
              </Grid>
            </Paper>
          </Route>
        </Switch>
      </MyContainer>
    </>
  );
};

export default Movies;
