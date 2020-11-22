import { Chip, makeStyles, Paper, Typography } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiRequest from '../api';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withResizeDetector } from 'react-resize-detector';
import { detectMob } from '../utils';

const tmdbImageUrl = 'https://image.tmdb.org/t/p';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    background: ({ backdropsUrl }) =>
      `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url('${backdropsUrl}') 0% 0% / cover no-repeat`,
    overflowY: 'auto',
    ...(detectMob()
      ? {}
      : {
          '&::-webkit-scrollbar': {
            width: theme.spacing(1),
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: theme.spacing(0.5),
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        }),
  },
  poster: {
    width: 300,
    height: 450,
    borderRadius: theme.spacing(0.4),
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    flexShrink: 0,
    display: 'flex',
    '& > img': {
      width: '100%',
      opacity: 0.8,
      borderRadius: theme.spacing(0.4),
    },
  },
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  releaseDate: {
    fontSize: '1.75rem',
    marginLeft: theme.spacing(1),
  },
  chipBorder: {
    border: '1px solid rgba(255, 255, 255, 1)',
    margin: theme.spacing(1, 0.5),
  },
  overview: {
    padding: theme.spacing(1, 0),
  },
}));

let AdaptivePaper = ({ width, height, targetRef, children, ...others }) => {
  return (
    <Paper
      {...others}
      style={{ height: width ? (width / 16) * 9 : 'auto', minHeight: 500 }}
    >
      {children}
    </Paper>
  );
};

AdaptivePaper.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  targetRef: PropTypes.any,
  children: PropTypes.node,
};

AdaptivePaper = withResizeDetector(AdaptivePaper);

const Movie = (props) => {
  const { movieId } = useParams();
  const [movieData, setMovieData] = useState(props.movie);

  const backdropsUrl = React.useMemo(() => {
    if (!movieData) return '';
    const backdrops = movieData.images.backdrops;
    return `${tmdbImageUrl}/w1280${backdrops[0].file_path}`;
  }, [movieData]);

  const classes = useStyles({ backdropsUrl: backdropsUrl });
  const valid = useMemo(() => Boolean(movieData), [movieData]);

  useEffect(() => {
    const fetchData = async () => {
      let res = await apiRequest('TMDb.getMovie', {
        params: [parseInt(movieId)],
      });
      setMovieData(res.data.result);
    };
    fetchData();
  }, [movieId]);

  return (
    <AdaptivePaper className={classes.paper}>
      <div className={classes.poster}>
        {valid ? (
          <img
            src={`${tmdbImageUrl}/w500${movieData.images.posters[0].file_path}`}
            alt="poster"
          />
        ) : null}
      </div>
      {valid ? (
        <div style={{ marginLeft: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Typography variant="h4" className={classes.textPrimary}>
              {movieData.title}
            </Typography>
            <Typography
              className={clsx(classes.textSecondary, classes.releaseDate)}
            >
              ({movieData.release_date.slice(0, 4)})
            </Typography>
          </div>
          {movieData.genres.map((item) => (
            <Chip
              key={item.name}
              variant="outlined"
              size="small"
              label={item.name}
              className={clsx(classes.textSecondary, classes.chipBorder)}
            />
          ))}
          <Chip
            variant="outlined"
            size="small"
            label={`${movieData.runtime}分钟`}
            className={clsx(classes.textSecondary, classes.chipBorder)}
          />
          <Typography
            variant="h6"
            className={clsx(classes.textPrimary, classes.overview)}
          >
            剧情简介
          </Typography>
          <Typography variant="body1" className={classes.textPrimary}>
            {movieData.overview}
          </Typography>
        </div>
      ) : null}
    </AdaptivePaper>
  );
};

Movie.propTypes = {
  movie: PropTypes.object,
};

export default Movie;
