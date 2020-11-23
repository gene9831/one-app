import Axios from 'axios';
import store from './store';

const DO_MAIN = 'http://onedrive.omv.local';
// const DO_MAIN = 'http://localhost:5000';
const JSONRPC_API = DO_MAIN + '/api/';
const FILE_URL = DO_MAIN + '/file';

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

export { DO_MAIN as API_URL, FILE_URL };
export default apiRequest;
