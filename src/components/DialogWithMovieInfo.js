import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Link,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React, { useMemo } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { setGlobalSnackbarMessage } from '../actions';
import { connect } from 'react-redux';
import { FILE_URL } from '../api';

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

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    background: (props) =>
      `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2)), url('${imageUrl}/w1280${props.backdrops_url}') 0% 0% / cover no-repeat`,
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
}));

let DialogWithMovieInfo = ({
  open,
  onClose,
  file,
  tmdbInfo,
  setGlobalSnackbarMessage,
}) => {
  const classes = useStyles({
    backdrops_url: tmdbInfo ? tmdbInfo.images.backdrops[0].file_path : '',
  });

  const file_url = useMemo(() => `${FILE_URL}/${file.id}/${file.name}`, [file]);

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
            src={`${imageUrl}/w300${tmdbInfo.images.posters[0].file_path}`}
            style={{ borderRadius: 4, flexShrink: 0 }}
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
            <Typography className={classes.textSecondary}>
              {tmdbInfo.genres.map((item) => `${item.name} `)}
              {tmdbInfo.runtime}分钟
            </Typography>
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
        <CopyToClipboard text={file_url}>
          <Button
            className={classes.textPrimary}
            onClick={() => setGlobalSnackbarMessage('已复制')}
          >
            复制链接
          </Button>
        </CopyToClipboard>
        <Button
          className={classes.textPrimary}
          component={Link}
          href={file_url}
        >
          直接下载
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
  setGlobalSnackbarMessage: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
  return {
    setGlobalSnackbarMessage: (message) =>
      dispatch(setGlobalSnackbarMessage(message)),
  };
};

DialogWithMovieInfo = connect(null, mapDispatchToProps)(DialogWithMovieInfo);

export default DialogWithMovieInfo;
