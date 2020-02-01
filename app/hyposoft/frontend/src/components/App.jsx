import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";

import SessionProvider from "./SessionProvider";
import Session from "../contexts/Session";
import LoginPage from "./auth/LoginPage/LoginPage";
import ManagementPageFrame from "./management/ManagementPageFrame";
import ModelManagementPage from "./management/ModelManagement/ModelManagementPage";
import ModelDetailPage from "./management/ModelManagement/ModelDetailPage";
import InstanceManagementPage from "./management/InstanceManagement/InstanceManagementPage";
import ToolingPage from "./management/Tooling/ToolingPage";
import HelpPage from "./management/Help/HelpPage";
import OverviewPage from "./management/Overview/OverviewPage";
import InstanceDetailPage from "./management/InstanceManagement/InstanceDetailPage";
import CreateModelPage from "./management/ModelManagement/CreateModelPage";
import CreateInstancePage from "./management/InstanceManagement/CreateInstancePage";
import RackManagementPage from "./management/RackManagement/RackManagementPage";
import RackView from "./management/RackManagement/RackView";

export default function App() {
  return (
    <SessionProvider>
      <Routes />
    </SessionProvider>
  );
}

function Routes() {
  const session = React.useContext(Session);

  return session.token ? (
    <Router>
      <Switch>
        <Route exact path="/racks/print_view">
          <RackView />
        </Route>
        <Route>
          <ManagementPageFrame>
            <Switch>
              <Route exact path="/models">
                <ModelManagementPage />
              </Route>
              <Route exact path="/models/create">
                <CreateModelPage />
              </Route>
              <Route exact path="/models/:id">
                <ModelDetailPage />
              </Route>

              <Route exact path="/instances">
                <InstanceManagementPage />
              </Route>
              <Route exact path="/instances/create">
                <CreateInstancePage />
              </Route>
              <Route exact path="/instances/:id">
                <InstanceDetailPage />
              </Route>

              <Route exact path="/racks">
                <RackManagementPage />
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
        </Route>
      </Switch>
    </Router>
  ) : (
    <LoginPage />
  );
}
