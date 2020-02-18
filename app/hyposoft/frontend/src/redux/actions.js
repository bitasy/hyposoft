import { displayError } from "../global/message";

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
        onSuccess(res);
      },
      err => {
        dispatch({ type: FAILURE, err });
        displayError(err);
        onFailure(err);
      }
    );
  };
}

export function genCRUDActionTypes(entity) {
  return crud_prefixes.map(s => `${s}_${entity}`);
}

export const noOp = () => {};

export function genCRUDActions(
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
