import Axios from 'axios';
import store from './store';

const API_URL = 'http://onedrive.omv.local';
// const API_URL = 'http://localhost:5000';
const JSONRPC_API = API_URL + '/api/';
const FILE_URL = API_URL + '/file';

const apiRequest = (method, { params, require_auth } = {}) => {
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

export { API_URL, FILE_URL };
export default apiRequest;
