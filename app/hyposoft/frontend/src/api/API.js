import Axios from "axios";

import produce from "immer";

// Auth APIs
function login(username, password) {
  return Axios.post("api/auth/token/", { username, password })
    .then(getData)
    .then(r => r.token);
}

function logout() {
  // we don't really send out api calls (for now)
  return Promise.resolve();
}

// Model APIs
function getModels() {
  return Axios.get("api/equipment/ITModelList").then(getData);
}

function getModel(id) {
  return Axios.get(`api/equipment/ITModelRetrieve/${id}`).then(getData);
}

function createModel(fields) {
  return Axios.post(`api/equipment/ITModelCreate`, fields).then(getData);
}

function updateModel(id, updates) {
  return Axios.patch(`api/equipment/ITModelUpdate/${id}`, updates).then(
    getData
  );
}

function deleteModel(id) {
  return Axios.delete(`api/equipment/ITModelDestroy/${id}`).then(getData);
}

// Instance APIs
function translate(instance) {
  Object.assign(instance, { model: instance.itmodel });
  delete instance.itmodel;
  return instance;
}

function getInstances() {
  return Axios.get("api/equipment/InstanceList")
    .then(getData)
    .then(instances => instances.map(translate));
}

// ex) A12
function getInstancesForRack(rackID) {
  return getInstances().then(instances =>
    instances.filter(inst => inst.rack.id === rackID)
  );
}

function getInstance(id) {
  return Axios.get(`api/equipment/InstanceRetrieve/${id}`)
    .then(getData)
    .then(translate);
}

function createInstance(fields) {
  const toCreate = produce(fields, draft => {
    draft.itmodel = draft.model.id;
    draft.rack = draft.rack.id;
    draft.owner = draft.owner.id;
    delete draft.model;
  });

  return Axios.post(`api/equipment/InstanceCreate`, toCreate)
    .then(getData)
    .then(translate);
}

// updates has the whole model/rack by itself rather than just model_id and rack.
// so we'll have to double check that here
function updateInstance(id, updates) {
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

  return Axios.patch(`api/equipment/InstanceUpdate/${id}`, patch)
    .then(getData)
    .then(translate);
}

function deleteInstance(id) {
  return Axios.delete(`api/equipment/InstanceDestroy/${id}`)
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
        rack: row + j
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

const RealAPI = {
  login,
  logout,

  getModels,
  getModel,
  createModel,
  updateModel,
  deleteModel,

  getInstances,
  getInstancesForRack,
  getInstance,
  createInstance,
  updateInstance,
  deleteInstance,

  getRacks,
  createRacks,
  deleteRacks,

  getUsers
};

export default RealAPI;
