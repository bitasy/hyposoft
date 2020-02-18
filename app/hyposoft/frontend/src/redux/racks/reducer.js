import { genAsyncReducer, genFetchAllReducer } from "../reducers";
import { REMOVE_RACKS, CREATE_RACKS, FETCH_ALL_RACKS } from "./actions";
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

function RemoveRacksReducer() {
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

const RackReducer = applyAll([
  FetchAllRacksReducer,
  CreateRacksReducer,
  RemoveRacksReducer
]);

export default RackReducer;
