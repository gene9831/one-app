import React from 'react';
import Admin from './components/Admin';
import Theme from './components/Theme';
import GlobalSnackbar from './components/GlobalSnackbar';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

export default function App() {
  return (
    <Theme>
      <Router>
        <Switch>
          <Route path="/admin">
            <Admin />
          </Route>
          <Route>Nothing for now</Route>
        </Switch>
      </Router>
      <GlobalSnackbar />
    </Theme>
  );
}
