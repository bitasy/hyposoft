import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";

import LoginPage from "./auth/LoginPage/LoginPage";
import ManagementPageFrame from "./management/ManagementPageFrame";
import ModelManagementPage from "./management/ModelManagement/ModelManagementPage";
import ModelDetailPage from "./management/ModelManagement/ModelDetailPage";
import InstanceManagementPage from "./management/InstanceManagement/InstanceManagementPage";
import ToolingPage from "./management/Tooling/ToolingPage";
import OverviewPage from "./management/Overview/OverviewPage";
import InstanceDetailPage from "./management/InstanceManagement/InstanceDetailPage";
import CreateModelPage from "./management/ModelManagement/CreateModelPage";
import CreateInstancePage from "./management/InstanceManagement/CreateInstancePage";
import RackManagementPage from "./management/RackManagement/RackManagementPage";
import RackView from "./management/RackManagement/RackView";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../redux/actions";

export default function App() {
  return <Routes />;
}

function Routes() {
  const dispatch = useDispatch();

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    dispatch(
      fetchCurrentUser(
        () => setLoading(false),
        () => setLoading(false)
      )
    );
  }, []);

  const currentUser = useSelector(s => s.currentUser);

  if (loading) {
    return <div />;
  }

  return currentUser ? (
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

              <Route exact path="/reports">
                <ToolingPage />
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
