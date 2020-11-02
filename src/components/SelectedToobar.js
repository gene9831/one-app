import React from 'react';
import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Fade from '@material-ui/core/Fade';
import CloseIcon from '@material-ui/icons/Close';
import Tooltip from '@material-ui/core/Tooltip';
import { connect } from 'react-redux';
import { OPERATING_STATUS } from '../actions';
import ComponentShell from './ComponentShell';

const useSelectedToobarStyles = makeStyles((theme) => ({
  selectedToolbar: {
    position: 'absolute',
    top: 0,
    width: '100%',
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    ...(theme.palette.type === 'light'
      ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.75),
        }
      : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        }),
  },
  title: {
    // flex: '1 1 100%',
    // display: 'flex',
    // justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
  },
}));

let SelectedToobar = (props) => {
  const classes = useSelectedToobarStyles();
  const {
    numSelected,
    buttonStatusLimit,
    operationStatus,
    onCancel,
    iconButtons,
    ToolbarComponent,
  } = props;
  return (
    <Fade in={numSelected > 0}>
      <ToolbarComponent className={classes.selectedToolbar}>
        <Typography
          variant="subtitle1"
          component="div"
          className={classes.title}
        >
          {numSelected} 已选择
        </Typography>
        {iconButtons.map((item) => (
          <Tooltip key={item.name} title={item.text}>
            <span>
              <IconButton
                color="inherit"
                onClick={item.onClick}
                disabled={
                  buttonStatusLimit &&
                  operationStatus === OPERATING_STATUS.RUNNING
                }
              >
                <ComponentShell Component={item.Icon} />
              </IconButton>
            </span>
          </Tooltip>
        ))}
        <div style={{ flexGrow: 1 }}></div>
        <Tooltip title="取消">
          <IconButton color="inherit" onClick={onCancel}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </ToolbarComponent>
    </Fade>
  );
};

SelectedToobar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  buttonStatusLimit: PropTypes.bool.isRequired,
  operationStatus: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
  iconButtons: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      Icon: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
    })
  ).isRequired,
  ToolbarComponent: PropTypes.oneOfType([PropTypes.object, PropTypes.func])
    .isRequired,
};

SelectedToobar.defaultProps = {
  buttonStatusLimit: true,
  iconButtons: [],
};

const mapStateToProps = (state) => ({
  operationStatus: state.operationStatus,
});

SelectedToobar = connect(mapStateToProps)(SelectedToobar);

export default SelectedToobar;
