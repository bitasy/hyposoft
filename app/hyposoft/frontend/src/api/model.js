import Axios from "axios";
import { getData, makeQueryString, withLoading } from "./utils";

export function createModel(fields) {
  return withLoading(() =>
    Axios.post("api/equipment/ITModelCreate", fields).then(getData),
  );
}

export function getModelList(query) {
  const q = {
    ...query,
    ordering: query.ordering
      ? `${query.direction === "descending" ? "-" : ""}${query.ordering}`
      : undefined,
  };

  return Axios.get(`api/equipment/ITModelList?${makeQueryString(q)}`).then(
    getData,
  );
}

export function getModelPicklist() {
  return Axios.get(`api/equipment/ITModelPickList`).then(getData);
}

export function getModel(id) {
  return Axios.get(`api/equipment/ITModelRetrieve/${id}`).then(getData);
}

export function getVendors() {
  return Axios.get(`api/equipment/VendorList`).then(getData);
}

export function updateModel(id, updates) {
  return withLoading(() =>
    Axios.patch(`api/equipment/ITModelUpdate/${id}`, updates).then(getData),
  );
}

export function deleteModel(id) {
  return withLoading(() =>
    Axios.delete(`api/equipment/ITModelDestroy/${id}`).then(getData),
  );
}