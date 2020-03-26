import { applyAll, genCrudReducer } from "../reducers";
import produce from "immer";
import { assetCRUDActionTypes } from "./actions";

function AssetCRUDReducer(s, a) {
  return produce(s, draft => {
    draft.assets = genCrudReducer(assetCRUDActionTypes)(draft.assets, a);
  });
}

const AssetReducer = applyAll([AssetCRUDReducer]);

export default AssetReducer;
