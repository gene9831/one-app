import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Theme from './components/Theme';
import GlobalSnackbar from './components/GlobalSnackbar';

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
