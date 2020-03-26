import Axios from "axios";
import { getData } from "./utils";

export function getPowerState(assetID) {
  return Axios.get(`prefix/PDUNetwork/get/${assetID}`).then(
    getData,
  );
}

// state should be "on" or "off"
export function updatePowerState(assetID, state) {
  return Axios.post(`prefix/PDUNetwork/post`, {
    asset_id: assetID,
    state,
  });
}

export function runPowerCycle(assetID) {
  return Axios.post(`prefix/PDUNetwork/cycle`, {
    asset_id: assetID,
  });
}
