import { genAsyncActionTypes } from "./actions";
import produce from "immer";
import SessionReducer from "./session/reducer";
import UserReducer from "./users/reducer";
import RackReducer from "./racks/reducer";
import ModelReducer from "./models/reducer";
import AssetReducer from "./assets/reducer";
import DatacenterReducer from "./datacenters/reducer";

export function genAsyncReducer(actionType, started, success, failure) {
  const [STARTED, SUCCESS, FAILURE] = genAsyncActionTypes(actionType);

  return (state = {}, action) => {
    switch (action.type) {
      case STARTED:
        return started(state);
      case SUCCESS:
        return success(state, action.res);
      case FAILURE:
        return failure(state, action.err);
      default:
        return state;
    }
  };
}

function groupByID(arr) {
  return arr.reduce((acc, elm) => {
    acc[elm.id] = elm;
    return acc;
  }, {});
}

export function genFetchAllReducer(fetchAllActionType) {
  return genAsyncReducer(
    fetchAllActionType,
    s => s,
    (s, res) => (res ? groupByID(res) : s),
    (s, err) => s
  );
}

export function genFetchReducer(fetchActionType) {
  return genAsyncReducer(
    fetchActionType,
    s => s,
    (s, res) =>
      produce(s, ds => {
        if (res && res.id) {
          ds[res.id] = res;
        }
      }),
    (s, err) => s
  );
}

export function genCreateReducer(createActionType) {
  return genAsyncReducer(
    createActionType,
    s => s,
    (s, res) =>
      produce(s, ds => {
        if (res && res.id) {
          ds[res.id] = res;
        }
      }),
    (s, err) => s
  );
}

export function genUpdateReducer(updateActionType) {
  return genAsyncReducer(
    updateActionType,
    s => s,
    (s, res) =>
      produce(s, ds => {
        if (res && res.id) {
          ds[res.id] = res;
        }
      }),
    (s, err) => s
  );
}

export function genRemoveReducer(removeActionType) {
  return genAsyncReducer(
    removeActionType,
    s => s,
    (s, res) =>
      produce(s, ds => {
        if (res && res.id) {
          delete ds[res.id];
        }
      }),
    (s, err) => s
  );
}

export function applyAll(reducers) {
  return (state, action) => reducers.reduce((s, r) => r(s, action), state);
}

export function genCrudReducer(crudActionTypes) {
  const [fetchAll, fetch, create, update, remove] = crudActionTypes;
  return applyAll([
    genFetchAllReducer(fetchAll),
    genFetchReducer(fetch),
    genCreateReducer(create),
    genUpdateReducer(update),
    genRemoveReducer(remove)
  ]);
}

function probe(reducer) {
  return (s, a) => {
    console.log(a);
    // console.log(s);
    const newS = reducer(s, a);
    // console.log(newS);
    return newS;
  };
}

const HyposoftApp = probe(
  applyAll([
    SessionReducer,
    UserReducer,
    RackReducer,
    ModelReducer,
    AssetReducer,
    DatacenterReducer
  ])
);

export default HyposoftApp;
