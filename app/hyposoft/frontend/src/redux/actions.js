import API from "../api/API";

const crud_prefixes = ["FETCH_ALL", "FETCH", "CREATE", "UPDATE", "REMOVE"];
const async_suffixes = ["STARTED", "SUCCESS", "FAILURE"];

export function genAsyncActionTypes(action) {
  return async_suffixes.map(s => `${action}_${s}`);
}

function genAsyncAction(actionType, op, args, onSuccess, onFailure) {
  const [STARTED, SUCCESS, FAILURE] = genAsyncActionTypes(actionType);
  return dispatch => {
    dispatch({ type: STARTED });
    return op(...args).then(
      res => {
        dispatch({ type: SUCCESS, res });
        onSuccess();
      },
      err => {
        dispatch({ type: FAILURE, err });
        onFailure();
      }
    );
  };
}

function genCRUDActionTypes(entity) {
  return crud_prefixes.map(s => `${s}_${entity}`);
}

const noOp = () => {};

function genCRUDActions(
  [FETCH_ALL, FETCH, CREATE, UPDATE, REMOVE], // action types
  [fetchAll, fetch, create, update, remove] // actual api functions
) {
  return [
    (onSuccess = noOp, onFailure = noOp) =>
      genAsyncAction(FETCH_ALL, fetchAll, [], onSuccess, onFailure),
    (id, onSuccess = noOp, onFailure = noOp) =>
      genAsyncAction(FETCH, fetch, [id], onSuccess, onFailure),
    (fields, onSuccess = noOp, onFailure = noOp) =>
      genAsyncAction(CREATE, create, [fields], onSuccess, onFailure),
    (id, updates, onSuccess = noOp, onFailure = noOp) =>
      genAsyncAction(UPDATE, update, [id, updates], onSuccess, onFailure),
    (id, onSuccess = noOp, onFailure = noOp) =>
      genAsyncAction(REMOVE, remove, [id], onSuccess, onFailure)
  ];
}

const ENTITY_MODEL = "MODEL";
const ENTITY_INSTANCE = "INSTANCE";

export const modelCRUDActionTypes = genCRUDActionTypes(ENTITY_MODEL);

const modelCRUDAPIs = [
  API.getModels,
  API.getModel,
  API.createModel,
  API.updateModel,
  API.deleteModel
];

export const [
  fetchModels,
  fetchModel,
  createModel,
  updateModel,
  removeModel
] = genCRUDActions(modelCRUDActionTypes, modelCRUDAPIs);

export const instanceCRUDActionTypes = genCRUDActionTypes(ENTITY_INSTANCE);

const instanceCRUDAPIs = [
  API.getInstances,
  API.getInstance,
  API.createInstance,
  API.updateInstance,
  API.deleteInstance
];

export const [
  fetchInstances,
  fetchInstance,
  createInstance,
  updateInstance,
  removeInstance
] = genCRUDActions(instanceCRUDActionTypes, instanceCRUDAPIs);

export const FETCH_ALL_RACKS = "FETCH_ALL_RACKS";
export const CREATE_RACKS = "CREATE_RACKS";
export const REMOVE_RACKS = "REMOVE_RACKS";

export const fetchRacks = (onSuccess = noOp, onFailure = noOp) =>
  genAsyncAction(FETCH_ALL_RACKS, API.getRacks, [], onSuccess, onFailure);

export const createRacks = (
  fromRow,
  toRow,
  fromNumber,
  toNumber,
  onSuccess = noOp,
  onFailure = noOp
) =>
  genAsyncAction(
    CREATE_RACKS,
    API.createRacks,
    [fromRow, toRow, fromNumber, toNumber],
    onSuccess,
    onFailure
  );

export const removeRacks = (rackIDs, onSuccess = noOp, onFailure = noOp) =>
  genAsyncAction(
    REMOVE_RACKS,
    API.deleteRacks,
    [rackIDs],
    onSuccess,
    onFailure
  );

export const FETCH_ALL_USERS = "FETCH_ALL_USERS";

export const fetchUsers = (onSuccess = noOp, onFailure = noOp) =>
  genAsyncAction(FETCH_ALL_USERS, API.getUsers, [], onSuccess, onFailure);
