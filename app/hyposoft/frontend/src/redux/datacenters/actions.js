import { genCRUDActionTypes, genCRUDActions } from "../actions";
import API from "../../api/API";

export const SWITCH_DATACENTER = "SWITCH_DATACENTER";

export const switchDatacenter = dcName => {
  return {
    type: SWITCH_DATACENTER,
    dcName
  };
};

const ENTITY_DATACENTER = "DATACENTER";

export const datacenterCRUDActionTypes = genCRUDActionTypes(ENTITY_DATACENTER);

const datacenterCRUDAPIs = [
  API.getDatacenters,
  API.getDatacenter,
  API.createDatacenter,
  API.updateDatacenter,
  API.deleteDatacenter
];

export const [
  fetchDatacenters,
  fetchDatacenter,
  createDatacenter,
  updateDatacenter,
  removeDatacenter
] = genCRUDActions(datacenterCRUDActionTypes, datacenterCRUDAPIs);