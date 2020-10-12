import React from 'react';
import UploadManage from './components/UploadManage';
import Login from './components/Login';
import cookies from './cookies';
import rpcRequest from './jsonrpc';

function App() {
  const [logged, setLogged] = React.useState(true);

  const setToken = (tokenObj) => {
    const { token, expires_at } = tokenObj;
    console.log(tokenObj);
    cookies.set('token', token, { expires: new Date(expires_at * 1000) });
    setLogged(true);
  };

  React.useEffect(() => {
    const fetchData = async () => {
      let res = await rpcRequest('Auth.validateToken', {
        params: [cookies.get('token')],
      });
      setToken(res.data.result);
    };
    fetchData().catch(() => {
      setLogged(false);
    });
  }, []);

  return logged ? <UploadManage /> : <Login setToken={setToken} />;
}

export default App;
