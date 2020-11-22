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
import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import MyAppBar from './MyAppBar';
import MyContainer from './MyContainer';
import Palette from './Palette';
import apiRequest from '../api';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Movie from './Movie';

const useStyles = makeStyles((theme) => ({
  actionArea: {
    borderRadius: theme.spacing(0.5),
    transition: '0.2s',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  card: {
    // TODO width可以作为参数传入
    width: 150,
    borderRadius: theme.spacing(0.5),
    '&:hover': {
      boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.5)',
    },
  },
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
              {movie.title}
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

const tmdbImageUrl = 'https://image.tmdb.org/t/p';

const Movies = () => {
  const match = useRouteMatch();
  const history = useHistory();

  const classes = useStyles();

  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      let res = await apiRequest('TMDb.getMovies');
      setMovies(res.data.result);
    };
    fetchData();
  }, []);

  return (
    <>
      <MyAppBar
        title="电影"
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
      <MyContainer>
        <Switch>
          <Route path={`${match.path}/:movieId`}>
            <Movie />
          </Route>
          <Route path={match.path}>
            <Paper className={classes.paper}>
              <Grid container spacing={2} className={classes.gridContainer}>
                {movies.map((movie) => (
                  <Grid item key={movie.id}>
                    <MovieCard
                      classes={classes}
                      movie={movie}
                      onClick={() => history.push(`${match.path}/${movie.id}`)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Route>
        </Switch>
      </MyContainer>
    </>
  );
};

export default Movies;
