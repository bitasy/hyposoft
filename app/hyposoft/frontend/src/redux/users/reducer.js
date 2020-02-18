import { FETCH_ALL_USERS } from "./actions";
import { genFetchAllReducer, applyAll } from "../reducers";

const UserReducer = applyAll([genFetchAllReducer(FETCH_ALL_USERS)]);

export default UserReducer;
