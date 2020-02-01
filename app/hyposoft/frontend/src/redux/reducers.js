import {
  genAsyncActionTypes,
  FETCH_ALL_RACKS,
  CREATE_RACKS,
  REMOVE_RACKS
} from "./actions";
import produce from "immer";
import { modelCRUDActionTypes, instanceCRUDActionTypes } from "./actions";
import { combineReducers } from "redux";

function genAsyncReducer(actionType, started, success, failure) {
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

function genFetchAllReducer(fetchAllActionType) {
  return genAsyncReducer(
    fetchAllActionType,
    s => s,
    (s, res) => groupByID(res),
    (s, err) => s
  );
}

function genFetchReducer(fetchActionType) {
  return genAsyncReducer(
    fetchActionType,
    s => s,
    (s, res) =>
      produce(s, ds => {
        ds[res.id] = res;
      }),
    (s, err) => s
  );
}

function genCreateReducer(createActionType) {
  return genAsyncReducer(
    createActionType,
    s => s,
    (s, res) =>
      produce(s, ds => {
        ds[res.id] = res;
      }),
    (s, err) => s
  );
}

function genUpdateReducer(updateActionType) {
  return genAsyncReducer(
    updateActionType,
    s => s,
    (s, res) =>
      produce(s, ds => {
        ds[res.id] = res;
      }),
    (s, err) => s
  );
}

function genRemoveReducer(removeActionType) {
  return genAsyncReducer(
    removeActionType,
    s => s,
    (s, res) =>
      produce(s, ds => {
        delete ds[res.id];
      }),
    (s, err) => s
  );
}

function applyAll(reducers) {
  return (state, action) => reducers.reduce((s, r) => r(s, action), state);
}

function genCrudReducer(crudActionTypes) {
  const [fetchAll, fetch, create, update, remove] = crudActionTypes;
  return applyAll([
    genFetchAllReducer(fetchAll),
    genFetchReducer(fetch),
    genCreateReducer(create),
    genUpdateReducer(update),
    genRemoveReducer(remove)
  ]);
}

function createRacksReducer() {
  return genAsyncReducer(
    CREATE_RACKS,
    s => s,
    (s, res) =>
      produce(s, ds => {
        res.forEach(rack => {
          ds[rack.id] = rack;
        });
      }),
    (s, err) => s
  );
}

function removeRacksReducer() {
  return genAsyncReducer(
    REMOVE_RACKS,
    s => s,
    (s, res) =>
      produce(s, ds => {
        res.forEach(rack => {
          delete ds[rack.id];
        });
      }),
    (s, err) => s
  );
}

function genRackReducer() {
  return applyAll([
    genFetchAllReducer(FETCH_ALL_RACKS),
    createRacksReducer(),
    removeRacksReducer()
  ]);
}

const modelReducer = genCrudReducer(modelCRUDActionTypes);
const instanceReducer = genCrudReducer(instanceCRUDActionTypes);
const rackReducer = genRackReducer();

const HyposoftApp = combineReducers({
  models: modelReducer,
  instances: instanceReducer,
  racks: rackReducer
});

export default HyposoftApp;
