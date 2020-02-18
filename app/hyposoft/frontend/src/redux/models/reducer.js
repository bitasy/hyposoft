import { applyAll, genCrudReducer } from "../reducers";
import produce from "immer";
import { modelCRUDActionTypes } from "../actions";

function ModelCRUDReducer(s, a) {
  return produce(s, draft => {
    draft.models = genCrudReducer(modelCRUDActionTypes)(draft.models, a);
  });
}

const ModelReducer = applyAll([ModelCRUDReducer]);

export default ModelReducer;
