import React from 'react';
import AdminManage from './AdminManage';
import AdminLogin from './AdminLogin';
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
          <AdminLogin root={match.path} />
        </Route>
        <Route path={match.path}>
          <AdminManage root={match.path} />
        </Route>
      </Switch>
    </React.Fragment>
  );
};

export default Admin;
