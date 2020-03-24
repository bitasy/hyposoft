import Axios from "axios";
import { getData, withLoading } from "./utils";

export function createDatacenter(fields) {
  return withLoading(() =>
    Axios.post(
      "api/equipment/DatacenterCreate",
      fields,
    ).then(getData),
  );
}

export function getDatacenters() {
  return Axios.get(`api/equipment/DatacenterList`).then(
    getData,
  );
}

export function updateDatacenter(id, updates) {
  return withLoading(() =>
    Axios.patch(
      `api/equipment/DatacenterUpdate/${id}`,
      updates,
    ).then(getData),
  );
}

export function deleteDatacenter(id) {
  return withLoading(() =>
    Axios.delete(
      `api/equipment/DatacenterDestroy/${id}`,
    ).then(getData),
  );
}
