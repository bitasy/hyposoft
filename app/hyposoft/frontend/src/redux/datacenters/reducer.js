import { SWITCH_DATACENTER, datacenterCRUDActionTypes } from "./actions";
import produce from "immer";
import { applyAll, genCreateReducer } from "../reducers";

function SwitchDatacenterReducer(s, a) {
  switch (a.type) {
    case SWITCH_DATACENTER:
      return produce(s, draft => {
        draft.appState.dcName = a.dcName;
      });
    default:
      return s;
  }
}

function DatacenterCRUDReducer(s, a) {
  return produce(s, draft => {
    draft.datacenters = genCreateReducer(datacenterCRUDActionTypes)(
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
