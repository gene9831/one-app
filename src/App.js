import React, { useState } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import UploadManage from './components/UploadManage';
import Login from './components/Login';
import cookies from './cookies';
import rpcRequest from './jsonrpc';

function App() {
  // 默认logged为true是保证默认页面是管理页面而不是登录页面
  const [logged, setLogged] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setError('');
  };

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
      let res = await rpcRequest('Auth.validateToken', {
        params: [tokenCookie],
      });
      handleWriteToken(res.data.result);
    };
    fetchData().catch((e) => {
      if (e.response) {
        setLogged(false);
      } else {
        setError('网络错误');
      }
    });
  }, []);

  return (
    <React.Fragment>
      {logged ? ( // authed为true，UploadManage组件才会去获取数据
        <UploadManage authed={authed} />
      ) : (
        <Login handleWriteToken={handleWriteToken} />
      )}
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={error.length > 0}
        onClose={handleClose}
        message={error}
        action={
          <Button color="secondary" size="small" onClick={handleClose}>
            确认
          </Button>
        }
      />
    </React.Fragment>
  );
}

export default App;
