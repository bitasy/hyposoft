import API from "../../api/API";
import { noOp, genAsyncAction } from "../actions";

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
