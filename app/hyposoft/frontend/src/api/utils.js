import { message } from "antd";
import { displayError } from "../global/message";
import {
  indexToCol,
  indexToRow,
  toIndex,
} from "../components/management/RackManagement/GridUtils";

export const GLOBAL_ABBR = "global";

export const DATACENTER_HEADER_NAME = "X-DATACENTER";
export const CHANGEPLAN_HEADER_NAME = "X-CHANGE-PLAN";

// overrides: { dcName: string, changePlanID: number }
export function makeHeaders(overrides) {
  const dcname = overrides?.dcName;
  const cpid = overrides?.changePlanID;
  return {
    ...(dcname != null ? { [DATACENTER_HEADER_NAME]: dcname } : {}),
    ...(cpid != null ? { [CHANGEPLAN_HEADER_NAME]: cpid } : {}),
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

  const [r1, c1] = query.rack_from
    ? toIndex(query.rack_from)
    : [undefined, undefined];
  const [r2, c2] = query.rack_to
    ? toIndex(query.rack_to)
    : [undefined, undefined];

  return {
    ...query,
    r1: r1 && indexToRow(r1),
    r2: r2 && indexToRow(r2),
    c1: c1 && indexToCol(c1),
    c2: c2 && indexToCol(c2),
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
