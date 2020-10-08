import Axios from 'axios';

const JSONRPC_API = 'http://localhost:5000/api/';
// const JSONRPC_API = 'http://api.onedrive.local/api/';
const JSONRPC_API_ADMIN = JSONRPC_API + 'admin';

const jsonrpc = (method, params) => {
  return Axios.post(JSONRPC_API, {
    jsonrpc: '2.0',
    method: method,
    params: params || [],
    id: new Date().getTime(),
  });
};

const jsonrpcAdmin = (method, params) => {
  return Axios.post(
    JSONRPC_API_ADMIN,
    {
      jsonrpc: '2.0',
      method: method,
      params: params || [],
      id: new Date().getTime(),
    },
    { headers: { 'X-Password': 'secret' } }
  );
};

export { jsonrpc, jsonrpcAdmin };
