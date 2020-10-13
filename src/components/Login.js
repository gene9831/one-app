import React from 'react';
import MainDrawer from './MainDrawer';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import rpcRequest from '../jsonrpc';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(16),
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

export default function Login(props) {
  const classes = useStyles();
  const { handleWriteToken } = props;
  const [passwrod, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwrod.length === 0) {
      setError('不能为空');
      return;
    }
    setError('');
    const fetchData = async () => {
      let res = await rpcRequest('Auth.login', { params: [passwrod] });
      handleWriteToken(res.data.result);
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
    <div>
      <MainDrawer title="登录">
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
      </MainDrawer>
    </div>
  );
}

Login.propTypes = {
  handleWriteToken: PropTypes.func.isRequired,
};
