import 'fontsource-roboto';
import { createStore } from 'redux';
import CombinedState from './reducers';
import cookies from './cookies';

const store = createStore(CombinedState, {
  palette: cookies.get('palette'),
  auth: { token: cookies.get('token') },
});

export default store;
