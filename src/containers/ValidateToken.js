import { useCallback, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setGlobalSnackbarMessage, setAuth } from '../actions';
import rpcRequest from '../jsonrpc';

let ValidateToken = (props) => {
  const { auth, setAuth, setGlobalSnackbarMessage } = props;
  const history = useHistory();

  const query = useMemo(() => new URLSearchParams(history.location.search), [
    history,
  ]);
  const pathname = useMemo(() => history.location.pathname, [history]);

  const handleAuthSucceed = useCallback(() => {
    history.push(query.get('redirect_url') || '/');
  }, [history, query]);

  const handleAuthFailed = useCallback(() => {
    // 失败，跳转路由
    if (pathname !== '/login') {
      history.push('/login?redirect_url=' + pathname);
    }
  }, [history, pathname]);

  useEffect(() => {
    if (auth.authed) return;
    if (!auth.token) {
      // 没有token
      handleAuthFailed();
      return;
    }
    const fetchData = async () => {
      let res = await rpcRequest('Admin.validateToken', {
        params: [auth.token],
      });
      const { token, expires_at } = res.data.result;
      setAuth({
        authed: true,
        token: token,
        expires: new Date(expires_at * 1000),
      });
      handleAuthSucceed();
    };
    fetchData().catch((e) => {
      if (e.response) {
        setAuth({
          authed: false,
        });
        handleAuthFailed();
      } else {
        setGlobalSnackbarMessage('网络错误');
      }
    });
  }, [
    auth,
    handleAuthFailed,
    handleAuthSucceed,
    setAuth,
    setGlobalSnackbarMessage,
  ]);
  return null;
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

const mapDispatchToProps = (dispatch) => {
  return {
    setAuth: (payload) => dispatch(setAuth(payload)),
    setGlobalSnackbarMessage: (message) =>
      dispatch(setGlobalSnackbarMessage(message)),
  };
};

ValidateToken = connect(mapStateToProps, mapDispatchToProps)(ValidateToken);

export default ValidateToken;
