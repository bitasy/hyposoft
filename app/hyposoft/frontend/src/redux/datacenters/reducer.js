import { SWITCH_DATACENTER, datacenterCRUDActionTypes } from "./actions";
import produce from "immer";
import { applyAll, genCrudReducer } from "../reducers";
import { DATACENTER_SESSION_KEY } from "../store";

function SwitchDatacenterReducer(s, a) {
  switch (a.type) {
    case SWITCH_DATACENTER:
      return produce(s, draft => {
        draft.appState.dcName = a.dcName;
        sessionStorage.setItem(DATACENTER_SESSION_KEY, a.dcName);
      });
    default:
      return s;
  }
}

function DatacenterCRUDReducer(s, a) {
  return produce(s, draft => {
    draft.datacenters = genCrudReducer(datacenterCRUDActionTypes)(
      draft.datacenters,
      a
    );
  });
}

const DatacenterReducer = applyAll([
  SwitchDatacenterReducer,
  DatacenterCRUDReducer
]);

export default DatacenterReducer;
