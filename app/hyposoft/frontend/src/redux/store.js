import { createStore, applyMiddleware } from "redux";
import HyposoftApp from "./reducers";
import thunk from "redux-thunk";

// we take care of only the "big" states for now
const initialState = {
  models: {},
  instances: {},
  racks: {},
  users: {}
};

const store = createStore(HyposoftApp, initialState, applyMiddleware(thunk));
window.store = store; // for debugging

export default store;
