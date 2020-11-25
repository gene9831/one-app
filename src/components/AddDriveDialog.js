import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slide from '@material-ui/core/Slide';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CloseIcon from '@material-ui/icons/Close';
import apiRequest from '../api';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import CircularProgress from '@material-ui/core/CircularProgress';
import CheckIcon from '@material-ui/icons/Check';
import Fab from '@material-ui/core/Fab';
import clsx from 'clsx';
import PriorityHighIcon from '@material-ui/icons/PriorityHigh';

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  backButton: {
    marginRight: theme.spacing(2),
  },
  instructions: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  stepsContainer: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  buttonSuccess: {
    backgroundColor: theme.palette.success.main,
    '&:hover': {
      backgroundColor: theme.palette.success.main,
    },
    width: '46px',
    height: '46px',
  },
  buttonFailed: {
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.main,
    },
    width: '46px',
    height: '46px',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const steps = ['登录微软账号', '复制链接', '完成'];
const initInstructions = [
  '点击打开新窗口按钮，在新窗口中登录微软账户进行授权',
  '登录成功后会重定向，复制重定向后的链接，粘贴到输入框',
  '等待结果',
  '添加帐号成功',
];

export default function AddDriveDialog(props) {
  const classes = useStyles();
  const { open, onClose, onDriveAdded } = props;
  const theme = useTheme();

  const [signInUrl, setSignInUrl] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  // const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');

  const hasError = Boolean(error);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      let res = await apiRequest('Onedrive.getSignInUrl', {
        require_auth: true,
      });
      setSignInUrl(res.data.result);
    };
    fetchData();
  }, [open]);

  const handleNext = () => {
    if (activeStep === 1) {
      const fetchData = async () => {
        await apiRequest('Onedrive.putCallbackUrl', {
          params: [callbackUrl],
          require_auth: true,
        });
        await onDriveAdded();
      };
      fetchData()
        .catch((e) => {
          if (e.response) {
            setError(e.response.data.error.message);
          } else {
            // 网络错误
            setError('网络错误');
          }
        })
        .finally(() => {
          setActiveStep(steps.length);
        });
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Dialog fullScreen open={open} TransitionComponent={Transition}>
      <AppBar
        className={classes.appBar}
        color={theme.palette.type === 'light' ? 'primary' : 'inherit'}
      >
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            添加 OneDrive 帐号
          </Typography>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container className={classes.container}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <Container maxWidth="sm" className={classes.stepsContainer}>
          {(() => {
            if (hasError) {
              return (
                <Fab className={clsx(classes.buttonFailed)}>
                  <PriorityHighIcon style={{ color: 'white' }} />
                </Fab>
              );
            } else if (activeStep === 0)
              return (
                <Button
                  component="a"
                  variant="contained"
                  color="secondary"
                  disabled={signInUrl === null}
                  href={signInUrl}
                  target="_blank"
                  onClick={() =>
                    setActiveStep((prevActiveStep) => prevActiveStep + 1)
                  }
                >
                  打开新窗口登录
                </Button>
              );
            else if (activeStep === 1)
              return (
                <TextField
                  autoFocus
                  fullWidth
                  label="粘贴链接到此处"
                  variant="outlined"
                  size="small"
                  value={callbackUrl}
                  onChange={(e) => setCallbackUrl(e.target.value)}
                />
              );
            else if (activeStep === 2)
              return (
                <div>
                  <CircularProgress color="secondary" />
                </div>
              );
            return (
              <Fab className={clsx(classes.buttonSuccess)}>
                <CheckIcon />
              </Fab>
            );
          })()}
          <Typography className={classes.instructions}>
            {hasError ? error : initInstructions[activeStep]}
          </Typography>
          <div>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.backButton}
              >
                返回
              </Button>
            ) : null}
            {activeStep < 2 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={activeStep === 1 && !callbackUrl.startsWith('http')}
              >
                下一步
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                disabled={activeStep !== steps.length}
                onClick={onClose}
              >
                完成
              </Button>
            )}
          </div>
        </Container>
      </Container>
    </Dialog>
  );
}

AddDriveDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onDriveAdded: PropTypes.func,
};
