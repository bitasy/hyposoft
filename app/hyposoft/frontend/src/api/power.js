import Axios from "axios";
import { getData, makeQueryString } from "./utils";

export function powerPortList(rackID) {
  return Axios.get(
    `api/power/PowerPortList?${makeQueryString({
      rack_id: rackID,
    })}`,
  ).then(getData);
}

export function getPowerState(assetID) {
  return Axios.get(`api/power/PDUNetwork/get/${assetID}`).then(getData);
}

// state should be "on" or "off"
export function updatePowerState(assetID, state) {
  return Axios.post(`api/power/PDUNetwork/post`, {
    asset_id: assetID,
    state,
  });
}

export function runPowerCycle(assetID) {
  return Axios.post(`api/power/PDUNetwork/cycle`, {
    asset_id: assetID,
  });
}
