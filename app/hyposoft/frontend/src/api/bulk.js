import Axios from "axios";
import jfd from "js-file-download";
import {
  getData,
  makeQueryString,
  withLoading,
} from "./utils";

export function importModels(buf, force) {
  return withLoading(() =>
    Axios.post(
      `api/import/ITModel?${makeQueryString({
        force: force,
      })}`,
      buf,
    ).then(getData),
  );
}

export function exportModels(query) {
  return Axios.get(
    `api/export/ITModel?${makeQueryString(query)}`,
  )
    .then(getData)
    .then(data => jfd(data, "models.csv"));
}

export function importAssets(buf, force) {
  return withLoading(() =>
    Axios.post(
      `api/import/Asset?${makeQueryString({
        force: force,
      })}`,
      buf,
    ).then(getData),
  );
}

export function exportAssets(query) {
  return Axios.get(
    `api/export/Asset?${makeQueryString(query)}`,
  )
    .then(getData)
    .then(data => jfd(data, "assets.csv"));
}

export function importModels(buf, force) {
  return withLoading(() =>
    Axios.post(
      `api/import/Network?${makeQueryString({
        force: force,
      })}`,
      buf,
    ).then(getData),
  );
}

export function exportModels(query) {
  return Axios.get(
    `api/export/Network?${makeQueryString(query)}`,
  )
    .then(getData)
    .then(data => jfd(data, "networks.csv"));
}
