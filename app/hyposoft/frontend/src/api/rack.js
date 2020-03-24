import Axios from "axios";
import { getData, withLoading, makeHeaders } from "./utils";

export function createRack(dcID, r1, r2, c1, c2) {
  return withLoading(() =>
    Axios.post(
      "api/equipment/RackRangeCreate",
      fields,
    ).then(getData),
  );
}

export function getRackList(dcName) {
  return Axios.get("api/equipment/RackList", {
    headers: makeHeaders({ dcName }),
  }).then(getData);
}

export function deleteRacks(rackIDs) {
  return Axios.delete(
    `api/equipment/BulkRackDestroy`,
    rackIDs,
  ).then(getData);
}
