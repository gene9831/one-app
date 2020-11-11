import React from 'react';
import UploadManage from './UploadManage';
import Login from './Login';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import StoreToken from '../containers/StoreToken';
import ValidateToken from '../containers/ValidateToken';

const Admin = () => {
  const match = useRouteMatch();

  return (
    <React.Fragment>
      <StoreToken />
      <ValidateToken root={match.path} />
      <Switch>
        <Route path={`${match.path}/login`}>
          <Login root={match.path} />
        </Route>
        <Route path={match.path}>
          <UploadManage root={match.path} />
        </Route>
      </Switch>
    </React.Fragment>
  );
};

export default Admin;
