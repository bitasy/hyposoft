import { createStore, applyMiddleware } from "redux";
import HyposoftApp from "./reducers";
import thunk from "redux-thunk";
import { getToken } from "../global/Session";

// we take care of only the "big" states for now
const initialState = {
  sessionInfo: getToken(),
  models: {},
  assets: {},
  racks: {},
  users: {}
};

const store = createStore(HyposoftApp, initialState, applyMiddleware(thunk));
window.store = store; // for debugging

export default store;
