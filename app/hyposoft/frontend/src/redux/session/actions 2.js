import { genAsyncAction, noOp } from "../actions";
import API from "../../api/API";

export const LOGIN = "LOGIN";

export const login = (username, password, onSuccess = noOp, onFailure = noOp) =>
  genAsyncAction(LOGIN, API.login, [username, password], onSuccess, onFailure);

export const LOGOUT = "LOGOUT";

export const logout = (onSuccess = noOp, onFailure = noOp) =>
  genAsyncAction(LOGOUT, API.logout, [], onSuccess, onFailure);

export const FETCH_CURRENT_USER = "FETCH_CURRENT_USER";

export const fetchCurrentUser = (onSuccess = noOp, onFailure = noOp) =>
  genAsyncAction(
    FETCH_CURRENT_USER,
    API.fetchCurrentUser,
    [],
    onSuccess,
    onFailure
  );
