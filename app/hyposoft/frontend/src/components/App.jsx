import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Switch, Route } from "react-router-dom";

import SessionProvider from "./SessionProvider";
import Session from "../contexts/Session";
import LoginPage from "./auth/LoginPage/LoginPage";
import ManagementPageFrame from "./management/ManagementPageFrame";
import ModelManagementPage from "./management/ModelManagement/ModelManagementPage";
import InstanceManagementPage from "./management/InstanceManagement/InstanceManagementPage";
import ToolingPage from "./management/Tooling/ToolingPage";
import HelpPage from "./management/Help/HelpPage";
import OverviewPage from "./management/Overview/OverviewPage";

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
    <Router>
      <ManagementPageFrame>
        <Switch>
          <Route path="/models">
            <ModelManagementPage />
          </Route>
          <Route path="/instances">
            <InstanceManagementPage />
          </Route>
          <Route exact path="/tools">
            <ToolingPage />
          </Route>
          <Route exact path="/help">
            <HelpPage />
          </Route>
          <Route>
            <OverviewPage />
          </Route>
        </Switch>
      </ManagementPageFrame>
    </Router>
  ) : (
    <LoginPage />
  );
}

/* eslint-env browser */
ReactDOM.render(<App />, document.getElementById("app"));
