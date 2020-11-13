import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import apiRequest from '../api';
import MyAppBar from './MyAppBar';
import Palette from './Palette';
import { AUTH_STATUS, setAuth } from '../actions';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

const useLoginPageStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

let LoginPage = (props) => {
  const classes = useLoginPageStyles();
  const { setAuth, root } = props;
  const [passwrod, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const history = useHistory();
  const query = useMemo(() => new URLSearchParams(history.location.search), [
    history,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwrod.length === 0) {
      setError('不能为空');
      return;
    }
    setError('');
    const fetchData = async () => {
      let res = await apiRequest('Admin.login', { params: [passwrod] });
      const { token, expires_at } = res.data.result;
      setAuth({
        status: AUTH_STATUS.PASS,
        token: token,
        expires: new Date(expires_at * 1000),
      });
      history.push(query.get('redirect_url') || root);
    };
    fetchData().catch((e) => {
      setError(
        e.response
          ? e.response.status >= 500
            ? '服务器发生错误'
            : '密码错误'
          : '网络错误'
      );
    });
  };

  return (
    <Container maxWidth="xs" className={classes.paper}>
      <Avatar className={classes.avatar}>
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        登录
      </Typography>
      <form className={classes.form} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="password"
          label="密码"
          type="password"
          id="password"
          error={error.length > 0}
          helperText={error}
          value={passwrod}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          className={classes.submit}
          onClick={handleSubmit}
        >
          登录
        </Button>
      </form>
    </Container>
  );
};

LoginPage.propTypes = {
  onSuccess: PropTypes.func,
  setAuth: PropTypes.func,
  root: PropTypes.string,
};

LoginPage.defaultProps = {
  onSuccess: () => {},
};

const mapDispatchToProps = (dispatch) => {
  return {
    setAuth: (payload) => dispatch(setAuth(payload)),
  };
};
LoginPage = connect(null, mapDispatchToProps)(LoginPage);

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  container: {
    flexGrow: 1,
  },
  toolbar: {
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
}));

export default function AdminLogin({ root }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <MyAppBar title="登录" endComponents={<Palette />} />
      <div className={classes.container}>
        <div className={classes.toolbar}></div>
        <LoginPage root={root} />
      </div>
    </div>
  );
}

AdminLogin.propTypes = {
  root: PropTypes.string,
};
