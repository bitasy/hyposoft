import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Switch, Route } from "react-router-dom";

import SessionProvider from "./SessionProvider";
import Session from "../contexts/Session";
import LoginPage from "./auth/LoginPage/LoginPage";
import ManagementPageFrame from "./management/ManagementPageFrame";
import Overview from "./management/Overview";

function App() {
  return (
    <SessionProvider>
      <Routes />
    </SessionProvider>
  );
}

function Routes() {
  const session = React.useContext(Session);

  return session.isLoggedIn ? (
    <ManagementPageFrame>
      <Router>
        <Switch>
          <Route exact path="/">
            <Overview />
          </Route>
        </Switch>
      </Router>
    </ManagementPageFrame>
  ) : (
    <LoginPage />
  );
}

/* eslint-env browser */
ReactDOM.render(<App />, document.getElementById("app"));
