import Axios from 'axios';
import cookies from './cookies';
const JSONRPC_API = 'http://localhost:5000/api/';
// const JSONRPC_API = 'http://api.onedrive.local/api/';

const rpcRequest = (method, { params, require_auth } = {}) => {
  return Axios.post(
    JSONRPC_API,
    {
      jsonrpc: '2.0',
      method: method,
      params: params || [],
      id: new Date().getTime(),
    },
    require_auth ? { headers: { 'X-Password': cookies.get('token') } } : {}
  );
};

export default rpcRequest;
