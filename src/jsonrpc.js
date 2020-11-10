import Axios from 'axios';
import store from './store';

// const JSONRPC_API = 'http://localhost:5000/api/';
const JSONRPC_API = 'http://onedrive.omv.local/api/';

const rpcRequest = (method, { params, require_auth } = {}) => {
  return Axios.post(
    JSONRPC_API,
    {
      jsonrpc: '2.0',
      method: method,
      params: params || [],
      id: new Date().getTime(),
    },
    require_auth
      ? { headers: { 'X-Password': store.getState().auth.token } }
      : {}
  );
};

export default rpcRequest;
