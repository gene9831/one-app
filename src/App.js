import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

const Theme = lazy(() => import('./components/Theme'));
const GlobalSnackbar = lazy(() => import('./components/GlobalSnackbar'));
const ItemList = lazy(() =>
  import(/* webpackChunkName: "item-list" */ './components/ItemList')
);
const Admin = lazy(() =>
  import(/* webpackChunkName: "admin" */ './components/Admin')
);
const NoRoute = lazy(() =>
  import(/* webpackChunkName: "no-route" */ './components/NoRoute')
);

export default function App() {
  return (
    <Suspense fallback={<div></div>}>
      <Theme>
        <Router>
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
        </Router>
        <GlobalSnackbar />
      </Theme>
    </Suspense>
  );
}
