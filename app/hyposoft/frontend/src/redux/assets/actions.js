import {
  genCRUDActions,
  genCRUDActionTypes,
  noOp,
  genAsyncAction
} from "../actions";
import API from "../../api/API";

const ENTITY_ASSET = "ASSET";

export const assetCRUDActionTypes = genCRUDActionTypes(ENTITY_ASSET);

const assetCRUDAPIs = [
  API.getAssets,
  API.getAsset,
  API.createAsset,
  API.updateAsset,
  API.deleteAsset
];

export const [
  ,
  fetchAsset,
  createAsset,
  updateAsset,
  removeAsset
] = genCRUDActions(assetCRUDActionTypes, assetCRUDAPIs);

export const fetchAssets = (dcName, onSuccess = noOp, onFailure = noOp) =>
  genAsyncAction(
    assetCRUDActionTypes[0],
    API.getAssets,
    [dcName],
    onSuccess,
    onFailure
  );
