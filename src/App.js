import React from 'react';
import UploadManage from './components/UploadManage';
import Login from './components/Login';
import Theme from './components/Theme';
import GlobalSnackbar from './components/GlobalSnackbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import StoreToken from './containers/StoreToken';
import ValidateToken from './containers/ValidateToken';

export default function App() {
  return (
    <Theme>
      <Router>
        <Switch>
          <Route path="/login">
            <Login />
            <ValidateToken />
          </Route>
          <Route path="/">
            <UploadManage />
            <ValidateToken />
          </Route>
        </Switch>
      </Router>
      <GlobalSnackbar />
      <StoreToken />
    </Theme>
  );
}
