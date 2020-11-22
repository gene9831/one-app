import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Theme from './components/Theme';
import GlobalSnackbar from './components/GlobalSnackbar';
import LinearProgress from '@material-ui/core/LinearProgress';

const ItemList = lazy(() =>
  import(/* webpackChunkName: "item-list" */ './components/ItemList')
);
const Admin = lazy(() =>
  import(/* webpackChunkName: "admin" */ './components/Admin')
);
const Movies = lazy(() => import('./components/Movies'));
const NoRoute = lazy(() =>
  import(/* webpackChunkName: "no-route" */ './components/NoRoute')
);

export default function App() {
  return (
    <Theme>
      <Router>
        <Suspense fallback={<LinearProgress />}>
          <Switch>
            <Route exact path="/">
              <ItemList />
            </Route>
            <Route path="/admin">
              <Admin />
            </Route>
            <Route path="/movies">
              <Movies />
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
