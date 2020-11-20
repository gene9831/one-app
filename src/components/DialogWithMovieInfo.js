import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import apiRequest from '../api';
import Chip from '@material-ui/core/Chip';

const detectMob = () => {
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
};

const imageUrl = 'https://image.tmdb.org/t/p';

const random = (n) => Math.floor(Math.random() * n);

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    background: (props) =>
      `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2)), url('${props.backdropsUrl}') 0% 0% / cover no-repeat`,
  },
  content: detectMob()
    ? {}
    : {
        '&::-webkit-scrollbar': {
          width: theme.spacing(1),
        },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: theme.spacing(0.5),
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
      },
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  releaseDate: {
    marginLeft: theme.spacing(1),
  },
  overview: {
    padding: theme.spacing(1, 0),
  },
  chipBorder: {
    border: '1px solid rgba(255, 255, 255, 0.7)',
    margin: theme.spacing(0.5),
  },
}));

let DialogWithMovieInfo = ({ open, onClose, file, handleAddPathChild }) => {
  const [tmdbInfo, setTmdbInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let res = await apiRequest('TMDb.getDataByTMDbId', {
        params: [file.tmdb_info.id],
      });
      setTmdbInfo(res.data.result);
    };
    fetchData().catch(() => {
      setTmdbInfo(null);
    });
  }, [file]);

  const backdropsUrl = React.useMemo(() => {
    if (!tmdbInfo) return '';
    const backdrops = tmdbInfo.images.backdrops;
    return `${imageUrl}/w1280${backdrops[random(backdrops.length)].file_path}`;
  }, [tmdbInfo]);

  const classes = useStyles({ backdropsUrl: backdropsUrl });

  if (!tmdbInfo) return null;
  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={onClose}
      PaperProps={{ className: classes.dialogPaper }}
    >
      <DialogContent className={classes.content}>
        <div style={{ display: 'flex' }}>
          <img
            width={300}
            height={450}
            src={`${imageUrl}/w500${tmdbInfo.images.posters[0].file_path}`}
            style={{ borderRadius: 4, flexShrink: 0, opacity: 0.85 }}
            alt={tmdbInfo.title}
          ></img>
          <div style={{ marginLeft: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Typography variant="h4" className={classes.textPrimary}>
                {tmdbInfo.title}
              </Typography>
              <Typography
                variant="h5"
                className={clsx(classes.textSecondary, classes.releaseDate)}
              >
                ({tmdbInfo.release_date.slice(0, 4)})
              </Typography>
            </div>
            {tmdbInfo.genres.map((item) => (
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
              label={`${tmdbInfo.runtime}分钟`}
              className={clsx(classes.textSecondary, classes.chipBorder)}
            />
            <Typography
              variant="h6"
              className={clsx(classes.textPrimary, classes.overview)}
            >
              剧情简介
            </Typography>
            <Typography className={classes.textPrimary}>
              {tmdbInfo.overview}
            </Typography>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button
          className={classes.textPrimary}
          onClick={() => handleAddPathChild(file.pathName)}
        >
          资源
        </Button>
        <Button className={classes.textPrimary} onClick={onClose}>
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DialogWithMovieInfo.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  file: PropTypes.object,
  tmdbInfo: PropTypes.object,
  handleAddPathChild: PropTypes.func,
};

export default DialogWithMovieInfo;
