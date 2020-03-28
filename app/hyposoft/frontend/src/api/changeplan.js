import Axios from "axios";
import { getData } from "./utils";

export function getChangePlanList() {
  return Axios.get("prefix/ChangePlanList").then(getData);
}

export function getChangePlanDetail(id) {
  return Axios.get(`prefix/ChangePlanDetails/${id}`).then(
    getData,
  );
}

export function getChangePlanActions(id) {
  return Axios.get(`prefix/ChangePlanActions/${id}`).then(
    getData,
  );
}

export function createChangePlan(name) {
  return Axios.post(`prefix/ChangePlanCreate`, {
    name,
  }).then(getData);
}

export function executeChangePlan(id) {
  return Axios.post(`prefix/ChangePlanExecute/${id}`).then(
    getData,
  );
}

export function updateChangePlan(id, name) {
  return Axios.patch(`prefix/ChangePlanUpdate/${id}`, {
    name,
  }).then(getData);
}

export function deleteChangePlan(id) {
  return Axios.delete(
    `prefix/ChangePlanDestroy/${id}`,
  ).then(getData);
}
