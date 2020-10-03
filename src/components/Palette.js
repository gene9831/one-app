import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import PaletteIcon from '@material-ui/icons/Palette';
import IconButton from '@material-ui/core/IconButton';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import cookies from '../cookies';

const useStyles = makeStyles((theme) => ({
  colorBlock: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    borderRadius: '4px',
    margin: 'auto',
  },
  paperScrollPaper: {
    minWidth: theme.spacing(60),
    bottom: '10%',
  },
  colorContainer: {
    '& >*': {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  selector: {
    maxHeight: theme.spacing(40),
  },
}));

export default function Palette(props) {
  const classes = useStyles();
  const { colorScheme, setColorScheme, initColorScheme, colors } = props;
  const [open, setOpen] = React.useState(false);
  const firstUpate = useRef(true);

  const handlePaletteClose = () => {
    setOpen(false);
  };

  const handleColorSchemeChange = (e) => {
    setColorScheme({
      ...colorScheme,
      [e.target.name]: e.target.value,
    });
  };

  const handleColorSchemeReset = () => {
    setColorScheme({
      ...initColorScheme,
      dark: colorScheme.dark,
    });
  };

  const handleColorSchemeDarken = () => {
    setColorScheme({
      ...colorScheme,
      dark: !colorScheme.dark,
    });
  };

  useEffect(() => {
    if (firstUpate.current) firstUpate.current = false;
    else cookies.set('colorScheme', colorScheme, { maxAge: 3600 * 24 * 30 });
  }, [colorScheme]);

  return (
    <React.Fragment>
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <PaletteIcon />
      </IconButton>
      <IconButton color="inherit" onClick={handleColorSchemeDarken}>
        {colorScheme.dark ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
      <Dialog
        open={open}
        onClose={handlePaletteClose}
        className={classes.dialog}
        classes={{
          paperScrollPaper: classes.paperScrollPaper,
        }}
      >
        <DialogTitle>主题颜色</DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <DialogContentText>选择你喜欢的颜色！</DialogContentText>
          <Grid container className={classes.colorContainer}>
            <Grid container justify="center">
              <Grid item xs={4}>
                <div
                  className={classes.colorBlock}
                  style={{
                    backgroundColor: colors[colorScheme.primary][500],
                  }}
                ></div>
              </Grid>
              <Grid item xs={1} />
              <Grid item xs={4}>
                <div
                  className={classes.colorBlock}
                  style={{
                    backgroundColor: colors[colorScheme.secondary][500],
                  }}
                ></div>
              </Grid>
            </Grid>
            <Grid container justify="center">
              <Grid item xs={4}>
                <TextField
                  select
                  name="primary"
                  label="Primary"
                  variant="outlined"
                  size="small"
                  value={colorScheme.primary}
                  onChange={handleColorSchemeChange}
                  fullWidth
                  SelectProps={{
                    MenuProps: {
                      classes: { paper: classes.selector },
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'center',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                      },
                      getContentAnchorEl: null,
                    },
                  }}
                >
                  {Object.keys(colors).map((item, index) => (
                    <MenuItem key={index} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={1} />
              <Grid item xs={4}>
                <TextField
                  select
                  name="secondary"
                  label="Secondary"
                  variant="outlined"
                  size="small"
                  value={colorScheme.secondary}
                  onChange={handleColorSchemeChange}
                  fullWidth
                  SelectProps={{
                    MenuProps: {
                      classes: { paper: classes.selector },
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'center',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                      },
                      getContentAnchorEl: null,
                    },
                  }}
                >
                  {Object.keys(colors).map((item, index) => (
                    <MenuItem key={index} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={handleColorSchemeReset}>
            重置
          </Button>
          <Button color="secondary" onClick={handlePaletteClose}>
            确定
          </Button>
        </DialogActions>
      </Dialog>{' '}
    </React.Fragment>
  );
}

Palette.propTypes = {
  colorScheme: PropTypes.object.isRequired,
  setColorScheme: PropTypes.func.isRequired,
  initColorScheme: PropTypes.object.isRequired,
  colors: PropTypes.object.isRequired,
};
