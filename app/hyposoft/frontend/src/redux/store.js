import { createStore, applyMiddleware } from "redux";
import HyposoftApp from "./reducers";
import thunk from "redux-thunk";

// we take care of only the "big" states for now
const initialState = {
  currentUser: null,
  appState: {
    dcName: "global"
  },
  models: {},
  assets: {},
  racks: {},
  users: {}
};

const store = createStore(
  (s, a) => HyposoftApp(s || initialState, a),
  initialState,
  applyMiddleware(thunk)
);
window.store = store; // for debugging

export default store;
