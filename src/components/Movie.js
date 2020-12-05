import {
  Chip,
  Grid,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import apiRequest from '../api';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withResizeDetector } from 'react-resize-detector';
import { bTokmg, detectMob, getComparator, random, stableSort } from '../utils';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import { PlayBoxOutline } from './Icons';
import DescriptionOutlinedIcon from '@material-ui/icons/DescriptionOutlined';
import SubtitlesOutlinedIcon from '@material-ui/icons/SubtitlesOutlined';
import ComponentShell from './ComponentShell';
import DialogWithFIle from './DialogWithFIle';
import MovieCard from './MovieCard';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

const tmdbImageUrl = 'https://image.tmdb.org/t/p';

const useStyles = makeStyles((theme) => ({
  paper: {
    display: 'flex',
    background: ({ backdropsUrl }) =>
      `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.3)), url('${backdropsUrl}') 0% 0% / cover no-repeat`,
    overflowY: 'auto',
  },
  paper2: {
    flexDirection: 'column',
  },
  collectionPaper: {
    display: 'flex',
    flexDirection: 'column',
  },
  paperPadding: {
    padding: theme.spacing(2),
  },
  poster: {
    width: 300,
    height: 450,
    borderRadius: theme.spacing(1),
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    flexShrink: 0,
    display: 'flex',
    '& > img': {
      width: '100%',
      opacity: 0.9,
      borderRadius: theme.spacing(1),
    },
  },
  poster2: {
    textAlign: 'center',
    borderRadius: theme.spacing(1),
    '& > img': {
      opacity: 0.9,
      borderRadius: theme.spacing(1),
    },
    paddingBottom: theme.spacing(0.5),
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
  flex: {
    display: 'flex',
  },
  itemIcon: {
    marginRight: theme.spacing(1),
  },
  ellipsis: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  textDiv: {
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
  textDivEdge: {
    marginLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  textDivMaxHeight: {
    maxHeight: 400,
  },
  movieTitle: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  actionArea: {
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: theme.spacing(0.5, 1),
    transition: theme.transitions.create('transform'),
  },
  title: {
    color: '#fff',
    textTransform: 'uppercase',
  },
  collectionDiv: {
    display: 'flex',
    overflow: 'auto',
    '& > div': {
      flex: 0,
      padding: theme.spacing(1),
    },
  },
  hidden: {
    display: 'none',
  },
  badgeSpan: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    transform: 'translate(-2px, 2px)',
    backgroundColor: 'white',
    borderRadius: '50%',
    '& > *': {
      transform: 'translate(-2px, -2px)',
    },
  },
  colorPrimary: {
    color: theme.palette.primary.main,
  },
  colorSuccess: {
    color: theme.palette.success.main,
  },
}));

// eslint-disable-next-line no-unused-vars
let AdaptivePaper = ({ width, height, targetRef, children, ...others }) => {
  const theme = useTheme();
  return (
    <Paper
      {...others}
      style={{
        height: width ? (width / 16) * 9 : 'auto',
        minHeight: 500,
        paddingRight: theme.spacing(1),
      }}
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

const getItemIcon = (item) => {
  if (item.folder) return FolderOpenIcon;
  const mimeType = item.file.mimeType;
  if (mimeType.startsWith('video')) return PlayBoxOutline;
  if (mimeType.startsWith('text')) return DescriptionOutlinedIcon;
  if (
    item.name.endsWith('srt') ||
    item.name.endsWith('ssa') ||
    item.name.endsWith('ass')
  )
    return SubtitlesOutlinedIcon;
  return InsertDriveFileOutlinedIcon;
};

const Movie = (props) => {
  const { movieId } = useParams();
  const [movieData, setMovieData] = useState(props.movie);
  const [resourceItems, setResourceItems] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [collectionData, setCollectionData] = useState(null);
  const history = useHistory();

  const collectionId = useMemo(() => {
    if (movieData && movieData.belongs_to_collection) {
      return movieData.belongs_to_collection.id;
    }
    return null;
  }, [movieData]);

  const downXs = useMediaQuery((theme) => theme.breakpoints.down('xs'));
  const downSm = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const backdropsUrl = React.useMemo(() => {
    if (!movieData) return '';
    const backdrops = movieData.images.backdrops;
    return `${tmdbImageUrl}/w1280${
      backdrops[random(backdrops.length)].file_path
    }`;
  }, [movieData]);

  const classes = useStyles({
    backdropsUrl: backdropsUrl,
    cardWidth: 150,
  });

  useEffect(() => {
    const fetchData = async () => {
      let res = await apiRequest('TMDb.getMovie', {
        params: [parseInt(movieId)],
      });
      setMovieData(res.data.result);
    };
    fetchData();
  }, [movieId]);

  useEffect(() => {
    const fetchData = async () => {
      let res = await apiRequest('TMDb.getItemsByMovieId', {
        params: [parseInt(movieId)],
      });
      setResourceItems(res.data.result);
    };
    fetchData();
  }, [movieId]);

  useEffect(() => {
    if (typeof collectionId === 'number') {
      const fetchData = async () => {
        let res = await apiRequest('TMDb.getCollection', {
          params: [collectionId],
        });
        setCollectionData(res.data.result);
      };
      fetchData();
    }
  }, [collectionId]);

  const handleClickMovieCard = (movie) => {
    if (!movie.exist || movieData.id === movie.id) {
      return;
    }
    history.push(`./${movie.id}`);
  };

  return (
    <Grid container spacing={downXs ? 1 : downSm ? 2 : 3}>
      {downXs ? (
        <Grid item xs={12}>
          <Paper
            className={clsx(
              classes.paper,
              classes.paper2,
              classes.paperPadding
            )}
          >
            <div className={classes.poster2}>
              {movieData ? (
                <img
                  src={`${tmdbImageUrl}/w500${movieData.images.posters[0].file_path}`}
                  width={300}
                  height={450}
                  alt="poster"
                />
              ) : null}
            </div>
            {movieData ? (
              <div className={clsx(classes.textDiv, classes.textDivMaxHeight)}>
                <div className={classes.movieTitle}>
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
          </Paper>
        </Grid>
      ) : (
        <Grid item xs={12}>
          <AdaptivePaper className={clsx(classes.paper, classes.paperPadding)}>
            <div className={classes.poster}>
              {movieData ? (
                <img
                  src={`${tmdbImageUrl}/w500${movieData.images.posters[0].file_path}`}
                  alt="poster"
                />
              ) : null}
            </div>
            {movieData ? (
              <div className={clsx(classes.textDiv, classes.textDivEdge)}>
                <div className={classes.movieTitle}>
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
        </Grid>
      )}
      {collectionData ? (
        <Grid item xs={12}>
          <Paper
            className={clsx(classes.collectionPaper, classes.paperPadding)}
          >
            <Typography variant="h6">{collectionData.name}</Typography>
            <div className={classes.collectionDiv}>
              {collectionData.parts.map((item) => (
                <div key={item.id} style={{ position: 'relative' }}>
                  <MovieCard
                    classes={classes}
                    movie={item}
                    onClick={() => handleClickMovieCard(item)}
                  />
                  <span
                    className={clsx(classes.badgeSpan, {
                      [classes.hidden]: !item.exist,
                    })}
                  >
                    <Tooltip
                      title={
                        item.exist
                          ? movieData.id === item.id
                            ? '当前电影'
                            : '已收录'
                          : ''
                      }
                    >
                      <CheckCircleIcon
                        fontSize="small"
                        className={clsx({
                          [classes.colorPrimary]:
                            item.exist && movieData.id !== item.id,
                          [classes.colorSuccess]:
                            item.exist && movieData.id === item.id,
                        })}
                      />
                    </Tooltip>
                  </span>
                </div>
              ))}
            </div>
          </Paper>
        </Grid>
      ) : null}
      {resourceItems.length > 0 ? (
        <Grid item xs={12}>
          <Paper className={classes.paperPadding}>
            <Typography variant="h6">资源</Typography>
            <TableContainer>
              <Table
                style={{
                  whiteSpace: 'nowrap',
                }}
              >
                <TableHead>
                  <TableRow>
                    {['名称', '修改日期', '类型', '大小'].map((item, index) => (
                      <TableCell key={index}>
                        <Typography>{item}</Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stableSort(resourceItems, getComparator('asc', 'name')).map(
                    (row, index) => (
                      <TableRow
                        key={index}
                        hover
                        onClick={() => setSelectedFile(row)}
                      >
                        <TableCell className={classes.flex}>
                          <ComponentShell
                            Component={getItemIcon(row)}
                            Props={{ className: classes.itemIcon }}
                          />
                          <Typography className={classes.ellipsis}>
                            {row.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography className={classes.ellipsis}>
                            {new Date(row.lastModifiedDateTime).toLocaleString(
                              [],
                              {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour12: false,
                              }
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography className={classes.ellipsis}>
                            {(() => {
                              if (row.folder) return '文件夹';
                              const idx = row.name.lastIndexOf('.');
                              if (idx < 0) return '.file';
                              return row.name.slice(idx + 1).toUpperCase();
                            })()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography className={classes.ellipsis}>
                            {row.folder
                              ? `${row.folder.childCount}项`
                              : bTokmg(row.size)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <DialogWithFIle
              open={Boolean(selectedFile)}
              file={selectedFile || {}}
              onClose={() => setSelectedFile(null)}
            />
          </Paper>
        </Grid>
      ) : null}
    </Grid>
  );
};

Movie.propTypes = {
  movie: PropTypes.object,
};

export default Movie;
