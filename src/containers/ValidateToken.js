import { useCallback, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { setGlobalSnackbarMessage, setAuth, AUTH_STATUS } from '../actions';
import rpcRequest from '../jsonrpc';

let ValidateToken = (props) => {
  const { auth, root, setAuth, setGlobalSnackbarMessage } = props;
  const history = useHistory();

  const query = useMemo(() => new URLSearchParams(history.location.search), [
    history,
  ]);
  const pathname = useMemo(() => history.location.pathname, [history]);

  const handleAuthSucceed = useCallback(
    (token, expires) => {
      // 成功，跳转路由
      setAuth({
        status: AUTH_STATUS.PASS,
        token: token,
        expires: new Date(expires * 1000),
      });
      history.push(query.get('redirect_url') || root);
    },
    [history, query, root, setAuth]
  );

  const handleAuthFailed = useCallback(
    (notoken = false) => {
      // 失败，跳转路由
      setAuth({
        status: notoken ? AUTH_STATUS.NOTOKEN : AUTH_STATUS.OUT,
      });
      if (pathname !== `${root}/login`) {
        history.push(`${root}/login?redirect_url=` + pathname);
      }
    },
    [history, pathname, root, setAuth]
  );

  useEffect(() => {
    // auth.status 等于任何一个确定值
    if (auth.status) return;
    if (!auth.token) {
      // 没有token
      handleAuthFailed(true);
      return;
    }
    const fetchData = async () => {
      let res = await rpcRequest('Admin.validateToken', {
        params: [auth.token],
      });
      const { token, expires_at } = res.data.result;
      handleAuthSucceed(token, expires_at);
    };
    fetchData().catch((e) => {
      if (e.response) {
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
