import { genAsyncReducer, genFetchAllReducer, applyAll } from "../reducers";
import {
  REMOVE_RACKS,
  CREATE_RACKS,
  FETCH_ALL_RACKS,
  FETCH_NETWORK_CONNECTED_PDUS
} from "./actions";
import produce from "immer";

function FetchAllRacksReducer(s, a) {
  return produce(s, draft => {
    draft.racks = genFetchAllReducer(FETCH_ALL_RACKS)(s.racks, a);
  });
}

function CreateRacksReducer(s, a) {
  return produce(s, draft => {
    draft.racks = genAsyncReducer(
      CREATE_RACKS,
      s => s,
      (s, res) =>
        produce(s, ds => {
          res.forEach(rack => {
            if (rack && rack.id) {
              ds[rack.id] = rack;
            }
          });
        }),
      (s, err) => s
    )(s.racks, a);
  });
}

function RemoveRacksReducer(s, a) {
  return produce(s, draft => {
    draft.racks = genAsyncReducer(
      REMOVE_RACKS,
      s => s,
      (s, res) =>
        produce(s, ds => {
          res.forEach(rack => {
            if (rack && rack.id) {
              delete ds[rack.id];
            }
          });
        }),
      (s, err) => s
    )(s.racks, a);
  });
}

function FetchNetworkConnectedPDUsReducer(s, a) {
  return produce(s, draft => {
    draft.networkConnectedPDUs = genAsyncReducer(
      FETCH_NETWORK_CONNECTED_PDUS,
      s => s,
      (s, res) => res,
      (s, err) => s
    )(s.networkConnectedPDUs, a);
  });
}

const RackReducer = applyAll([
  FetchAllRacksReducer,
  CreateRacksReducer,
  RemoveRacksReducer,
  FetchNetworkConnectedPDUsReducer
]);

export default RackReducer;
