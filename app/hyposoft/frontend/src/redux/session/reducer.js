import { applyAll, genAsyncReducer } from "../reducers";
import produce from "immer";
import { FETCH_CURRENT_USER, LOGOUT, LOGIN } from "./actions";

function LoginReducer(s, a) {
  return produce(s, draft => {
    draft.currentUser = genAsyncReducer(
      LOGIN,
      s => s,
      (s, res) => res,
      (s, err) => s
    )(s.currentUser, a);
  });
}

function LogoutReducer() {
  return produce(s, draft => {
    draft.currentUser = genAsyncReducer(
      LOGOUT,
      s => s,
      (s, res) => res,
      (s, err) => s
    )(s.currentUser, a);
  });
}

function FetchCurrentUserReducer() {
  return produce(s, draft => {
    draft.currentUser = genAsyncReducer(
      FETCH_CURRENT_USER,
      s => s,
      (s, res) => res,
      (s, err) => s
    )(s.currentUser, a);
  });
}

const SessionReducer = applyAll([
  LoginReducer,
  LogoutReducer,
  FetchCurrentUserReducer
]);

export default SessionReducer;
