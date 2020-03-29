import { createStore, applyMiddleware } from "redux";
import HyposoftApp from "./reducers";
import thunk from "redux-thunk";

export const DATACENTER_SESSION_KEY = "DATACENTER";

// we take care of only the "big" states for now
const initialState = {
  currentUser: null,
  appState: {
    dcName: sessionStorage.getItem(DATACENTER_SESSION_KEY) || "global"
  },
  models: {},
  assets: {},
  datacenters: {},
  racks: {},
  users: {},
  networkConnectedPDUs: []
};

const store = createStore(
  (s, a) => HyposoftApp(s || initialState, a),
  initialState,
  applyMiddleware(thunk)
);
window.store = store; // for debugging

export default store;
