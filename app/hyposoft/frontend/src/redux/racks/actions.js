import API from "../../api/API";
import { noOp, genAsyncAction } from "../actions";

export const FETCH_ALL_RACKS = "FETCH_ALL_RACKS";
export const CREATE_RACKS = "CREATE_RACKS";
export const REMOVE_RACKS = "REMOVE_RACKS";
export const FETCH_NETWORK_CONNECTED_PDUS = "FETCH_NETWORK_CONNECTED_PDUS";

export const fetchRacks = (dcName, onSuccess = noOp, onFailure = noOp) =>
  genAsyncAction(FETCH_ALL_RACKS, API.getRacks, [dcName], onSuccess, onFailure);

export const createRacks = (
  fromRow,
  toRow,
  fromNumber,
  toNumber,
  dcID,
  onSuccess = noOp,
  onFailure = noOp
) =>
  genAsyncAction(
    CREATE_RACKS,
    API.createRacks,
    [fromRow, toRow, fromNumber, toNumber, dcID],
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

export const fetchNetworkConnectedPDUs = (onSuccess = noOp, onFailure = noOp) =>
  genAsyncAction(
    FETCH_NETWORK_CONNECTED_PDUS,
    API.getNetworkConnectedPDUs,
    [],
    onSuccess,
    onFailure
  );
