import { noOp, genAsyncAction } from "../actions";
import API from "../../api/API";

export const FETCH_ALL_USERS = "FETCH_ALL_USERS";

export const fetchUsers = (onSuccess = noOp, onFailure = noOp) =>
  genAsyncAction(FETCH_ALL_USERS, API.getUsers, [], onSuccess, onFailure);
