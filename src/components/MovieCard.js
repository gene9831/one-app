import {
  Box,
  Card,
  CardActionArea,
  CardMedia,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const tmdbImageUrl = 'https://image.tmdb.org/t/p';

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
          image={
            movie.poster_path ? `${tmdbImageUrl}/w200${movie.poster_path}` : ''
          }
          className={classes.media}
        >
          <Box
            className={clsx(classes.content, {
              [classes.contentUp]: hover,
              [classes.contentDown]: !hover,
            })}
          >
            <Typography className={classes.title} variant="body2">
              {`${movie.title} (${
                movie.release_date ? movie.release_date.slice(0, 4) : '待定'
              })`}
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

export default MovieCard;
