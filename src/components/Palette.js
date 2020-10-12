import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import PaletteIcon from '@material-ui/icons/Palette';
import IconButton from '@material-ui/core/IconButton';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import Typography from '@material-ui/core/Typography';
import { colors as defaultColors } from '@material-ui/core';
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

const colors = Object.assign({}, defaultColors);
delete colors.common;

export default function Palette(props) {
  const classes = useStyles();
  const { customPalette, setCustomPalette, initPalette } = props;
  const [open, setOpen] = React.useState(false);
  const didMount = useRef(true);

  const handlePaletteClose = () => {
    setOpen(false);
  };

  // const handleColorSchemeChange = (e) => {
  //   setCustomPalette({
  //     ...customPalette,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  const handleColorSchemeReset = () => {
    setCustomPalette({
      ...initPalette,
      type: customPalette.type,
    });
  };

  const handleColorSchemeDarken = () => {
    setCustomPalette({
      ...customPalette,
      type: customPalette.type === 'light' ? 'dark' : 'light',
    });
  };

  useEffect(() => {
    // 从cookie中获取配色
    const cookiePalette = cookies.get('palette');
    if (cookiePalette) {
      setCustomPalette(cookiePalette);
    }
  }, [setCustomPalette]);

  useEffect(() => {
    if (didMount.current) didMount.current = false;
    else {
      // 每次更新都会保存cookie
      cookies.set('palette', customPalette, { maxAge: 3600 * 24 * 30 });
    }
  }, [customPalette]);

  return (
    <React.Fragment>
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <PaletteIcon />
      </IconButton>
      <IconButton color="inherit" onClick={handleColorSchemeDarken}>
        {customPalette.type === 'dark' ? (
          <Brightness7Icon />
        ) : (
          <Brightness4Icon />
        )}
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
            <Typography component="h2" variant="h6">
              开发中，进度1% ...
            </Typography>
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
      </Dialog>
    </React.Fragment>
  );
}

Palette.propTypes = {
  customPalette: PropTypes.object.isRequired,
  setCustomPalette: PropTypes.func.isRequired,
  initPalette: PropTypes.object.isRequired,
};

Palette.defaultProps = {};
