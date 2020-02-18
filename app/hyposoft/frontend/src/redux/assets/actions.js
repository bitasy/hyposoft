import { genCRUDActions, genCRUDActionTypes } from "../actions";
import API from "../../api/API";

export const assetCRUDActionTypes = genCRUDActionTypes(ENTITY_ASSET);

const assetCRUDAPIs = [
  API.getAssets,
  API.getAsset,
  API.createAsset,
  API.updateAsset,
  API.deleteAsset
];

export const [
  fetchAssets,
  fetchAsset,
  createAsset,
  updateAsset,
  removeAsset
] = genCRUDActions(assetCRUDActionTypes, assetCRUDAPIs);
