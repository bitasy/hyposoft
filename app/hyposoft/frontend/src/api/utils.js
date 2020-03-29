import { message } from "antd";
import { displayError } from "../global/message";
import { DATACENTER_ABBR_SESSION_KEY } from "../components/App";
import { CHANGE_PLAN_SESSION_KEY } from "../components/App";

export const GLOBAL_ABBR = "global";

// overrides: { dcName: string, changePlanID: number }
export function makeHeaders(overrides) {
  const dcname =
    overrides?.dcName ?? sessionStorage.getItem(DATACENTER_ABBR_SESSION_KEY);
  const cpid =
    overrides?.changePlanID ?? sessionStorage.getItem(CHANGE_PLAN_SESSION_KEY);

  return {
    ...(dcname != null ? { "X-DATACENTER": dcname } : {}),
    ...(cpid != null ? { "X-CHANGE-PLAN": cpid } : { "X-CHANGE-PLAN": 0 }),
  };
}

export async function withLoading(op) {
  const handle = message.loading("Action in progress...", 0);
  try {
    const res = await op();
    message.success("Success!");
    return res;
  } catch (e) {
    displayError(e);
    throw e;
  } finally {
    handle();
  }
}

export function getData(res) {
  return res.status < 300 ? res.data : Promise.reject(res.data);
}

export function makeQueryString(query) {
  return Object.entries(query)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}
