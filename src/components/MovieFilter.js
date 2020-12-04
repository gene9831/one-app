import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Chip,
  Collapse,
  Grid,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
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
  filterOpen2: {
    height: 180,
    flexShrink: 0,
    transition: theme.transitions.create('height', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  filterClose2: {
    height: 0,
    transition: theme.transitions.create('height', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
  },
  genresDiv2: {
    display: 'flex',
    overflowX: 'auto',
  },
  container: {
    alignItems: 'center',
  },
  twoChip: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

const MovieFilter = ({
  open,
  orderList,
  orderIndex,
  setOrderIndex,
  genres,
  selectedGenres,
  setSelectedGenres,
  genresLogical,
  setGenresLogical,
}) => {
  const downXs = useMediaQuery((theme) => theme.breakpoints.down('xs'));
  const classes = useStyles({ filterWidth: 200, downXs: downXs });
  const [filter, setFilter] = useState({
    sort: true,
    genres: true,
  });

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

  return downXs ? (
    <div
      className={clsx({
        [classes.filterOpen2]: open,
        [classes.filterClose2]: !open,
      })}
    >
      <Grid container className={classes.container}>
        <Grid item xs={2}>
          <Typography>排序</Typography>
        </Grid>
        <Grid item xs={10}>
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
        </Grid>
        <Grid item xs={2}>
          <Typography>分类</Typography>
        </Grid>
        <Grid item xs={10}>
          <div className={classes.genresDiv2}>
            {[...new Array(Math.ceil(genres.length / 2)).keys()].map(
              (index) => (
                <div key={index} classes={classes.twoChip}>
                  {(() => {
                    const item1 = genres[index * 2];
                    const item2 = genres[index * 2 + 1];
                    return (
                      <>
                        <Chip
                          label={item1.name}
                          variant="outlined"
                          color={
                            findSelectedGenre(item1.id) ? 'primary' : 'default'
                          }
                          className={classes.genresChip}
                          onClick={() => handleClickGenre(item1.id)}
                        />
                        {item2 ? (
                          <Chip
                            label={item2.name}
                            variant="outlined"
                            color={
                              findSelectedGenre(item2.id)
                                ? 'primary'
                                : 'default'
                            }
                            className={classes.genresChip}
                            onClick={() => handleClickGenre(item2.id)}
                          />
                        ) : null}
                      </>
                    );
                  })()}
                </div>
              )
            )}
          </div>
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
            color={genresLogical === '$or' ? 'primary' : 'secondary'}
            className={classes.genresChip}
            onClick={() => setGenresLogical('$or')}
          />
          <Chip
            label="$and"
            variant="outlined"
            color={genresLogical === '$and' ? 'primary' : 'secondary'}
            className={classes.genresChip}
            onClick={() => setGenresLogical('$and')}
          />
        </Grid>
      </Grid>
    </div>
  ) : (
    <div
      className={clsx({
        [classes.filterOpen]: open,
        [classes.filterClose]: !open,
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
              genres: !prev.genres,
            }))
          }
        >
          <ListItemText primary="分类"></ListItemText>
          {filter.genres ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={filter.genres}>
          <div className={classes.genresDiv}>
            {genres.map((item) => (
              <Chip
                label={item.name}
                key={item.id}
                variant="outlined"
                color={findSelectedGenre(item.id) ? 'primary' : 'default'}
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
              color={genresLogical === '$or' ? 'primary' : 'secondary'}
              className={classes.genresChip}
              onClick={() => setGenresLogical('$or')}
            />
            <Chip
              label="$and"
              variant="outlined"
              color={genresLogical === '$and' ? 'primary' : 'secondary'}
              className={classes.genresChip}
              onClick={() => setGenresLogical('$and')}
            />
          </div>
        </Collapse>
      </List>
    </div>
  );
};

MovieFilter.propTypes = {
  open: PropTypes.bool.isRequired,
  orderList: PropTypes.array.isRequired,
  orderIndex: PropTypes.number.isRequired,
  setOrderIndex: PropTypes.func.isRequired,
  genres: PropTypes.array.isRequired,
  selectedGenres: PropTypes.array.isRequired,
  setSelectedGenres: PropTypes.func.isRequired,
  genresLogical: PropTypes.string.isRequired,
  setGenresLogical: PropTypes.func.isRequired,
};

export default MovieFilter;
