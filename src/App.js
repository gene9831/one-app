import React, { lazy, Suspense } from 'react';
import Theme from './components/Theme';
import GlobalSnackbar from './components/GlobalSnackbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NoRoute from './components/NoRoute';

const ItemList = lazy(() => import('./components/ItemList'));
const Admin = lazy(() => import('./components/Admin'));

export default function App() {
  return (
    <Theme>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route exact path="/">
              <ItemList />
            </Route>
            <Route path="/admin">
              <Admin />
            </Route>
            <Route>
              <NoRoute />
            </Route>
          </Switch>
        </Suspense>
      </Router>
      <GlobalSnackbar />
    </Theme>
  );
}
