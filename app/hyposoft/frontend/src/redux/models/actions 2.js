import { genCRUDActionTypes, genCRUDActions } from "../actions";
import API from "../../api/API";

const ENTITY_MODEL = "MODEL";

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
