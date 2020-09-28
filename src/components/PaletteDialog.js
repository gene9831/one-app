import React from 'react';
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

const useStyles = makeStyles((theme) => ({
  colorBlock: {
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    margin: 'auto',
  },
  paperScrollPaper: {
    bottom: '10%',
  },
  colorContainer: {
    minWidth: '380px',
    '& >*': {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  selector: {
    maxHeight: '300px',
  },
}));

export default function PaletteDialog(props) {
  const classes = useStyles();
  const {
    openPalette,
    handleClosePalette,
    customColor,
    handleChangeCustomColor,
    handleResetColor,
    colors,
  } = props;

  return (
    <Dialog
      open={openPalette}
      onClose={handleClosePalette}
      classes={{
        paperScrollPaper: classes.paperScrollPaper,
      }}
    >
      <DialogTitle>主题颜色</DialogTitle>
      <DialogContent>
        <DialogContentText>选择你喜欢的颜色！</DialogContentText>
        <Grid container className={classes.colorContainer}>
          <Grid container justify="center">
            <Grid item xs={4}>
              <div
                className={classes.colorBlock}
                style={{
                  backgroundColor: colors[customColor.primary][500],
                }}
              ></div>
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={4}>
              <div
                className={classes.colorBlock}
                style={{
                  backgroundColor: colors[customColor.secondary][500],
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
                value={customColor.primary}
                onChange={handleChangeCustomColor}
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
                value={customColor.secondary}
                onChange={handleChangeCustomColor}
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
        <Button color="primary" onClick={handleResetColor}>
          重置
        </Button>
        <Button color="secondary" onClick={handleClosePalette}>
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
}

PaletteDialog.propTypes = {
  openPalette: PropTypes.bool.isRequired,
  handleClosePalette: PropTypes.func.isRequired,
  customColor: PropTypes.object.isRequired,
  handleChangeCustomColor: PropTypes.func.isRequired,
  handleResetColor: PropTypes.func.isRequired,
  colors: PropTypes.object.isRequired,
};
