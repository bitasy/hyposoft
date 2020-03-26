import { FETCH_ALL_USERS } from "./actions";
import { genFetchAllReducer, applyAll } from "../reducers";
import produce from "immer";

function UserFetchingReducer(s, a) {
  return produce(s, draft => {
    draft.users = genFetchAllReducer(FETCH_ALL_USERS)(draft.users, a);
  });
}

const UserReducer = applyAll([UserFetchingReducer]);

export default UserReducer;
