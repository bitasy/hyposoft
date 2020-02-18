import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";

import LoginPage from "./auth/LoginPage/LoginPage";
import ManagementPageFrame from "./management/ManagementPageFrame";
import ModelManagementPage from "./management/ModelManagement/ModelManagementPage";
import ModelDetailPage from "./management/ModelManagement/ModelDetailPage";
import AssetManagementPage from "./management/AssetManagement/AssetManagementPage";
import ToolingPage from "./management/Tooling/ToolingPage";
import OverviewPage from "./management/Overview/OverviewPage";
import AssetDetailPage from "./management/AssetManagement/AssetDetailPage";
import CreateModelPage from "./management/ModelManagement/CreateModelPage";
import CreateAssetPage from "./management/AssetManagement/CreateAssetPage";
import RackManagementPage from "./management/RackManagement/RackManagementPage";
import RackView from "./management/RackManagement/RackView";
import { useSelector, useDispatch } from "react-redux";
import { fetchCurrentUser } from "../redux/session/actions";
import DatacenterManagementPage from "./management/DatacenterManagment/DatacenterManagementPage";

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

              <Route exact path="/assets">
                <AssetManagementPage />
              </Route>
              <Route exact path="/assets/create">
                <CreateAssetPage />
              </Route>
              <Route exact path="/assets/:id">
                <AssetDetailPage />
              </Route>

              <Route exact path="/datacenters">
                <DatacenterManagementPage />
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
