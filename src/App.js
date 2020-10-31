import React, { useState } from 'react';
import UploadManage from './components/UploadManage';
import PropTypes from 'prop-types';
import Login from './components/Login';
import cookies from './cookies';
import rpcRequest from './jsonrpc';
import Theme from './components/Theme';
import GlobalSnackbar from './components/GlobalSnackbar';
import { connect } from 'react-redux';
import { setGlobalSnackbarMessage } from './actions';

let App = ({ setGlobalSnackbarMessage }) => {
  // 默认logged为true是保证默认页面是管理页面而不是登录页面
  const [logged, setLogged] = useState(true);
  const [authed, setAuthed] = useState(false);

  const handleWriteToken = (tokenObj) => {
    const { token, expires_at } = tokenObj;
    cookies.set('token', token, { expires: new Date(expires_at * 1000) });
    setLogged(true);
    setAuthed(true);
  };

  React.useEffect(() => {
    const tokenCookie = cookies.get('token');
    if (!tokenCookie) {
      // 没有token
      setLogged(false);
      return;
    }
    const fetchData = async () => {
      let res = await rpcRequest('Admin.validateToken', {
        params: [tokenCookie],
      });
      handleWriteToken(res.data.result);
    };
    fetchData().catch((e) => {
      if (e.response) {
        setLogged(false);
        cookies.remove('token');
      } else {
        setGlobalSnackbarMessage('网络错误');
      }
    });
  }, [setGlobalSnackbarMessage]);

  return (
    <Theme>
      {logged ? ( // authed为true，UploadManage组件才会去获取数据
        <UploadManage
          authed={authed}
          setAuthed={setAuthed}
          setLogged={setLogged}
        />
      ) : (
        <Login handleWriteToken={handleWriteToken} />
      )}
      <GlobalSnackbar />
    </Theme>
  );
};

App.propTypes = {
  setGlobalSnackbarMessage: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => {
  return {
    setGlobalSnackbarMessage: (message) =>
      dispatch(setGlobalSnackbarMessage(message)),
  };
};

App = connect(null, mapDispatchToProps)(App);

export default App;
