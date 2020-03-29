import { message } from "antd";
import { displayError } from "../global/message";
import { DATACENTER_ABBR_SESSION_KEY } from "../components/App";
import { CHANGE_PLAN_SESSION_KEY } from "../components/App";
import {
  indexToCol,
  indexToRow,
  toIndex,
} from "../components/management/RackManagement/GridUtils";

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

export function processAssetQuery(query) {
  const directionPrefix = `${query.direction === "descending" ? "-" : ""}`;

  const whatCanIDoIfDjangoForcesMeToLOL = {
    model: ["itmodel__vendor", "itmodel__model_number"],
    hostname: ["hostname"],
    location: ["datacenter__abbr", "rack__rack", "rack_position"],
    owner: ["owner"],
  };

  const ordering = whatCanIDoIfDjangoForcesMeToLOL[query.ordering];

  const [r1, c1] = toIndex(query.rack_from);
  const [r2, c2] = toIndex(query.rack_to);

  return {
    ...query,
    r1: indexToRow(r1),
    r2: indexToRow(r2),
    c1: indexToCol(c1),
    c2: indexToCol(c2),
    ordering: ordering
      ? ordering.map(o => directionPrefix + o).join(",")
      : undefined,
  };
}

export function processModelQuery(query) {
  return {
    ...query,
    ordering: query.ordering
      ? `${query.direction === "descending" ? "-" : ""}${query.ordering}`
      : undefined,
  };
}
