import React from 'react';
import Admin from './components/Admin';
import Theme from './components/Theme';
import GlobalSnackbar from './components/GlobalSnackbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NoRoute from './components/NoRoute';
import ItemList from './components/ItemList';

export default function App() {
  return (
    <Theme>
      <Router>
        <Switch>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route path="/">
            <ItemList />
          </Route>
          <Route>
            <NoRoute />
          </Route>
        </Switch>
      </Router>
      <GlobalSnackbar />
    </Theme>
  );
}
