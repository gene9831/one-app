import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'fontsource-roboto';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import CombinedState from './reducers';
import cookies from './cookies';

const store = createStore(CombinedState, {
  palette: cookies.get('palette'),
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
