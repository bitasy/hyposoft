import Axios from "axios";

import produce from "immer";

// Auth APIs
function fetchCurrentUser() {
  return Axios.get("auth/current_user").then(getData);
}

function login(username, password) {
  return Axios.post("auth/login", { username, password }).then(getData);
}

function logout() {
  // we don't really send out api calls (for now)
  return Axios.post("auth/logout").then(getData);
}

// Model APIs
function translateModel(model) {
  model.network_port_labels =
    model.network_port_labels && model.network_port_labels.map(l => l.name);
  return model;
}

function getModels() {
  return Axios.get("api/equipment/ITModelList")
    .then(getData)
    .then(lst => lst.map(translateModel));
}

function getModel(id) {
  return Axios.get(`api/equipment/ITModelRetrieve/${id}`)
    .then(getData)
    .then(translateModel);
}

function createModel(fields) {
  return Axios.post(`api/equipment/ITModelCreate`, fields)
    .then(getData)
    .then(model => model.id)
    .then(id =>
      Promise.all(
        (fields.network_port_labels || []).map(v => {
          return createNetworkPortLabel({
            itmodel: id,
            name: v.name
          });
        })
      ).then(() => getModel(id))
    );
}

function destroyAllNetworkPortLabels(modelID) {
  return Axios.get(`api/equipment/ITModelRetrieve/${modelID}`)
    .then(getData)
    .then(model =>
      Promise.all(
        model.network_port_labels.map(v => removeNetworkPortLabel(v.id))
      )
    );
}

function updateModel(id, updates) {
  return destroyAllNetworkPortLabels(id)
    .then(() =>
      Promise.all(
        updates.network_port_labels.map(name =>
          createNetworkPortLabel({ name, itmodel: id })
        )
      )
    )
    .then(() => Axios.patch(`api/equipment/ITModelUpdate/${id}`, updates))
    .then(getData);
}

function deleteModel(id) {
  return Axios.delete(`api/equipment/ITModelDestroy/${id}`).then(getData);
}

// Asset APIs
function translate(asset) {
  Object.assign(asset, { model: asset.itmodel });
  delete asset.itmodel;
  return asset;
}

function getAssets() {
  return Axios.get("api/equipment/AssetList")
    .then(getData)
    .then(assets => assets.map(translate));
}

// ex) A12
function getAssetsForRack(rackID) {
  return getAssets().then(assets =>
    assets.filter(asset => asset.rack.id === rackID)
  );
}

function getAsset(id) {
  return Axios.get(`api/equipment/AssetRetrieve/${id}`)
    .then(getData)
    .then(translate);
}

function createAsset(fields) {
  const toCreate = produce(fields, draft => {
    draft.itmodel = draft.model.id;
    draft.rack = draft.rack.id;
    draft.owner = draft.owner && draft.owner.id;
    delete draft.model;
  });

  return Axios.post(`api/equipment/AssetCreate`, toCreate)
    .then(getData)
    .then(translate);
}

// updates has the whole model/rack by itself rather than just model_id and rack.
// so we'll have to double check that here
function updateAsset(id, updates) {
  const patch = produce(updates, draft => {
    if (draft.model) {
      draft.itmodel = updates.model.id;
      delete draft.model;
    }
    if (draft.rack) {
      draft.rack = draft.rack.id;
    }
    if (draft.owner) {
      draft.owner = draft.owner.id;
    }
  });

  return Axios.patch(`api/equipment/AssetUpdate/${id}`, patch)
    .then(getData)
    .then(translate);
}

function deleteAsset(id) {
  return Axios.delete(`api/equipment/AssetDestroy/${id}`)
    .then(getData)
    .then(translate);
}

// Rack APIs
function getRacks() {
  return Axios.get("api/equipment/RackList").then(getData);
}

function createRack(rack) {
  return Axios.post("api/equipment/RackCreate", rack).then(getData);
}

function createRacks(fromRow, toRow, fromNumber, toNumber) {
  const toCreate = [];
  for (let i = fromRow.charCodeAt(0); i <= toRow.charCodeAt(0); i++) {
    const row = String.fromCharCode(i);
    for (let j = parseInt(fromNumber); j <= parseInt(toNumber); j++) {
      toCreate.push({
        rack: row + (j < 10 ? "0" : "") + j
      });
    }
  }

  return Promise.all(toCreate.map(createRack)).then(removeNulls);
}

function deleteRack(rackID) {
  return Axios.delete(`api/equipment/RackDestroy/${rackID}`).then(getData);
}

function deleteRacks(rackIDs) {
  return Promise.all(rackIDs.map(deleteRack)).then(removeNulls);
}

// User APIs
function getUsers() {
  return Axios.get("api/users/UserList").then(getData);
}

function removeNulls(arr) {
  return arr.filter(a => a != null);
}

function getData(res) {
  return res.status < 300 ? res.data : Promise.reject(res.data);
}

// DC APIs
function getDatacenters() {
  return Axios.get("api/equipment/DatacenterList").then(getData);
}

function getDatacenter(id) {
  return Axios.get(`api/equipment/DatacenterRetrieve/${id}`).then(getData);
}

function createDatacenter(fields) {
  return Axios.post(`api/equipment/DatacenterCreate`, fields).then(getData);
}

function updateDatacenter(id, updates) {
  return Axios.patch(`api/equipment/DatacenterUpdate/${id}`, updates).then(
    getData
  );
}

function deleteDatacenter(id) {
  return Axios.delete(`api/equipment/DatacenterDestroy/${id}`).then(getData);
}

// Network port label APIs
function createNetworkPortLabel(fields) {
  return Axios.post(`api/equipment/NetworkPortLabelCreate`, fields).then(
    getData
  );
}

function updateNetworkPortLabel(id, updates) {
  return Axios.patch(
    `api/equipment/NetworkPortLabelUpdate/${id}`,
    updates
  ).then(getData);
}

function removeNetworkPortLabel(id) {
  return Axios.delete(`api/equipment/NetworkPortLabelDestroy/${id}`).then(
    getData
  );
}

const RealAPI = {
  fetchCurrentUser,
  login,
  logout,

  getModels,
  getModel,
  createModel,
  updateModel,
  deleteModel,

  getAssets,
  getAssetsForRack,
  getAsset,
  createAsset,
  updateAsset,
  deleteAsset,

  getRacks,
  createRacks,
  deleteRacks,

  getDatacenters,
  getDatacenter,
  createDatacenter,
  updateDatacenter,
  deleteDatacenter,

  createNetworkPortLabel,
  updateNetworkPortLabel,
  removeNetworkPortLabel,

  getUsers
};

export default RealAPI;
