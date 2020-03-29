import React from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";

import LoginPage from "./auth/LoginPage/LoginPage";
import ManagementPageFrame from "./management/ManagementPageFrame";
import ModelManagementPage from "./management/ModelManagement/ModelManagementPage";
import ModelDetailPage from "./management/ModelManagement/ModelDetailPage";
import AssetManagementPage from "./management/AssetManagement/AssetManagementPage";
import ReportManagementPage from "./management/ReportManagement/ReportManagementPage";
import LandingPage from "./management/LandingPage/LandingPage";
import AssetDetailPage from "./management/AssetManagement/AssetDetailPage";
import CreateModelPage from "./management/ModelManagement/CreateModelPage";
import CreateAssetPage from "./management/AssetManagement/CreateAssetPage";
import RackManagementPage from "./management/RackManagement/RackManagementPage";
import RackView from "./management/RackManagement/RackView";
import LogManagementPage from "./management/LogManagement/LogManagementPage";
import DatacenterManagementPage from "./management/DatacenterManagment/DatacenterManagementPage";
import {
  AuthContext,
  DCContext,
  ChangePlanContext,
} from "../contexts/contexts";

export const DATACENTER_SESSION_KEY = "DATACENTER";
export const DATACENTER_ABBR_SESSION_KEY = "DATACENTER_ABBR";

export const CHANGE_PLAN_SESSION_KEY = "CHANGE_PLAN";
export const CHANGE_PLAN_NAME_SESSION_KEY = "CHANGE_PLAN_NAME";

import { getCurrentUser } from "../api/auth";
import { getDatacenters } from "../api/datacenter";
import Testing from "./utility/Testing";
import WorkOrderPage from "./management/ChangePlan/WorkOrderPage";
import ChangePlanList from "./management/ChangePlan/ChangePlanList";
import CreateChangePlan from "./management/ChangePlan/CreateChangePlan";
import ChangePlanDetail from "./management/ChangePlan/ChangePlanDetail";
import useTrigger from "./utility/useTrigger";
import ModelImportPage from "./management/Import/ModelImportPage";

function App() {
  const [loading, setLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [datacenter, setDatacenter] = React.useState(null);
  const [dcTrigger, fireDCTrigger] = useTrigger();
  const [changePlan, setChangePlan] = React.useState(null);
  const [cpTrigger, fireCPTrigger] = useTrigger();

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await getCurrentUser().then(setCurrentUser);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      const dcID = parseInt(sessionStorage.getItem(DATACENTER_SESSION_KEY));
      if (!isNaN(dcID)) {
        const dc = await getDatacenters().then(
          dcs => dcs.find(dc => dc.id == dcID) ?? null,
        );
        setDatacenter(dc);
      }
    })();
  }, []);

  React.useEffect(() => {
    const id = sessionStorage.getItem(CHANGE_PLAN_SESSION_KEY);
    const name = sessionStorage.getItem(CHANGE_PLAN_NAME_SESSION_KEY);
    const cp = id && name ? { id, name } : null;
    setChangePlan(cp);
  }, []);

  if (loading) {
    return <div />;
  }

  const authContextValue = {
    user: currentUser,
    setUser: setCurrentUser,
  };

  const dcContextValue = {
    datacenter,
    setDCName: async dcName => {
      if (dcName) {
        const dc = await getDatacenters().then(
          dcs => dcs.find(dc => dc.abbr == dcName) ?? null,
        );
        if (dc) {
          sessionStorage.setItem(DATACENTER_SESSION_KEY, dc?.id);
          sessionStorage.setItem(DATACENTER_ABBR_SESSION_KEY, dc?.abbr);
          setDatacenter(dc);
          return;
        }
      }

      sessionStorage.removeItem(DATACENTER_SESSION_KEY);
      sessionStorage.removeItem(DATACENTER_ABBR_SESSION_KEY);
      setDatacenter(null);
    },
    setDCByID: async dcID => {
      if (dcID) {
        const dc = await getDatacenters().then(
          dcs => dcs.find(dc => dc.id == dcID) ?? null,
        );
        if (dc) {
          sessionStorage.setItem(DATACENTER_SESSION_KEY, dc?.id);
          sessionStorage.setItem(DATACENTER_ABBR_SESSION_KEY, dc?.abbr);
          setDatacenter(dc);
          return;
        }
      }

      sessionStorage.removeItem(DATACENTER_SESSION_KEY);
      sessionStorage.removeItem(DATACENTER_ABBR_SESSION_KEY);
      setDatacenter(null);
    },
    refreshTrigger: dcTrigger,
    refresh: fireDCTrigger,
  };

  const cpContextValue = {
    changePlan,
    setChangePlan: cp => {
      if (cp) {
        const { id, name } = cp;
        sessionStorage.setItem(CHANGE_PLAN_SESSION_KEY, id);
        sessionStorage.setItem(CHANGE_PLAN_NAME_SESSION_KEY, name);
      } else {
        sessionStorage.removeItem(CHANGE_PLAN_SESSION_KEY);
        sessionStorage.removeItem(CHANGE_PLAN_NAME_SESSION_KEY);
      }
    },
    refreshTrigger: cpTrigger,
    refresh: fireCPTrigger,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <DCContext.Provider value={dcContextValue}>
        <ChangePlanContext.Provider value={cpContextValue}>
          {currentUser ? (
            <Router>
              <Switch>
                <Route exact path="/testing">
                  <Testing />
                </Route>
                <Route exact path="/racks/print_view">
                  <RackView />
                </Route>
                <Route exact path="/changeplan/workorder">
                  <WorkOrderPage />
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
                        <ReportManagementPage />
                      </Route>
                      <Route exact path="/logs">
                        <LogManagementPage />
                      </Route>
                      <Route exact path="/changeplan">
                        <ChangePlanList />
                      </Route>
                      <Route exact path="/changeplan/create">
                        <CreateChangePlan />
                      </Route>
                      <Route exact path="/changeplan/:id">
                        <ChangePlanDetail />
                      </Route>
                      <Route exact path="/import/model">
                        <ModelImportPage />
                      </Route>
                      <Route>
                        <LandingPage />
                      </Route>
                    </Switch>
                  </ManagementPageFrame>
                </Route>
              </Switch>
            </Router>
          ) : (
            <LoginPage />
          )}
        </ChangePlanContext.Provider>
      </DCContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
