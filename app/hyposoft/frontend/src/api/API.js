import Cookies from "js-cookie";
import * as Axios from "axios";

import { models, instances, racks } from "./simdb";

const USE_MOCKED = true;

export const SESSION_COOKIE_NAME = Axios.defaults.xsrfCookieName; // maybe not

// Auth APIs
function login(username, password) {
  return Axios.post("", { username, password });
}

function mockedLogin() {
  Cookies.set(SESSION_COOKIE_NAME, "mocked session cookie");
  return Promise.resolve();
}

function logout() {
  return Axios.post("");
}

function mockedLogout() {
  Cookies.remove(SESSION_COOKIE_NAME);
  return Promise.resolve();
}

// Model APIs
function getModels() {
  return Axios.get("");
}

function mockedGetModels() {
  return Promise.resolve(Object.values(models));
}

function getModel(id) {
  return Axios.get(`${id}`);
}

function mockedGetModel(id) {
  return Promise.resolve(models[id]);
}

function createModel(fields) {
  return Axios.post("", fields);
}

function mockedCreateModel(fields) {
  const newID = Object.keys(models).length;
  models[newID] = { id: newID, ...fields };
  return Promise.resolve(newID);
}

function updateModel(id, updates) {
  return Axios.patch(`${id}`, updates);
}

function mockedUpdateModel(id, updates) {
  Object.assign(models[id], updates);
  return Promise.resolve(models[id]);
}

function deleteModel(id) {
  return Axios.delete(`${id}`);
}

function mockedDeleteModel(id) {
  const toRemove = models[id];
  Object.keys(instances).forEach(instanceID => {
    if (instances[instanceID].model.id === id) {
      delete instances[instanceID];
    }
  });
  delete models[id];
  return Promise.resolve(toRemove);
}

// Instance APIs
function getInstances() {
  return Axios.get("");
}

function mockedGetInstances() {
  return Promise.all(Object.keys(instances).map(mockedGetInstance));
}

// ex) A12
function getInstancesForRack(rackID) {
  return Axios.get(`${rackID}`);
}

function mockedGetInstancesForRack(rackID) {
  return mockedGetInstances().then(instances =>
    instances.filter(instance => instance.rack.id === rackID)
  );
}

function getInstance(id) {
  return Axios.get(`${id}`);
}

function mockedGetInstance(id) {
  return Promise.resolve({
    ...instances[id],
    model: models[instances[id].model],
    rack: racks[instances[id].rack]
  });
}

function createInstance(fields) {
  return Axios.post("", fields);
}

function mockedCreateInstance(fields) {
  const newID = Object.keys(instances).length;
  instances[newID] = {
    id: newID,
    ...fields,
    model: fields.model.id,
    rack: fields.rack.id
  };
  return Promise.resolve(newID);
}

// updates has the whole model/rack by itself rather than just model_id and rack_id.
// so we'll have to double check that here
function updateInstance(id, updates) {
  return Axios.patch(`${id}`, updates);
}

function mockedUpdateInstance(id, updates) {
  Object.assign(
    instances[id],
    updates,
    updates.model ? { model: updates.model.id } : {},
    updates.rack ? { rack: updates.rack.id } : {}
  );
  return mockedGetInstance(id);
}

function deleteInstance(id) {
  return Axios.delete(`${id}`);
}

function mockedDeleteInstance(id) {
  const toRemove = instances[id];
  delete instances[id];
  return Promise.resolve(toRemove);
}

// Rack APIs
function getRacks() {
  return Axios.get("");
}

function mockedGetRacks() {
  return Promise.resolve(Object.values(racks));
}

function createRacks(fromRow, toRow, fromNumber, toNumber) {
  return Axios.post("", { fromRow, toRow, fromNumber, toNumber });
}

function mockedCreateRacks(fromRow, toRow, fromNumber, toNumber) {
  const createdIDs = [];

  for (let i = fromRow.charCodeAt(0); i <= toRow.charCodeAt(0); i++) {
    const row = String.fromCharCode(i);
    for (let j = fromNumber; j <= toNumber; j++) {
      const newID = Object.keys(racks).length;
      racks[newID] = {
        id: newID,
        row,
        number: j
      };
      createdIDs.push(newID);
    }
  }

  return Promise.resolve(createdIDs);
}

function deleteRacks(fromRow, toRow, fromNumber, toNumber) {
  return Axios.delete("", { fromRow, toRow, fromNumber, toNumber });
}

function mockedDeleteRacks(fromRow, toRow, fromNumber, toNumber) {
  const deleted = [];

  const toDelete = [];
  for (let i = fromRow.charCodeAt(0); i <= toRow.charCodeAt(0); i++) {
    const row = String.fromCharCode(i);
    for (let j = fromNumber; j <= toNumber; j++) {
      toDelete.push(row + j);
    }
  }

  Object.keys(racks).map(id => {
    if (toDelete.includes(racks[id].row + racks[id].number)) {
      deleted.push(racks[id]);
      delete racks[id];
    }
  });

  return Promise.resolve(deleted);
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
  deleteRacks
};

const MockedAPI = {
  login: mockedLogin,
  logout: mockedLogout,

  getModels: mockedGetModels,
  getModel: mockedGetModel,
  createModel: mockedCreateModel,
  updateModel: mockedUpdateModel,
  deleteModel: mockedDeleteModel,

  getInstances: mockedGetInstances,
  getInstancesForRack: mockedGetInstancesForRack,
  getInstance: mockedGetInstance,
  createInstance: mockedCreateInstance,
  updateInstance: mockedUpdateInstance,
  deleteInstance: mockedDeleteInstance,

  getRacks: mockedGetRacks,
  createRacks: mockedCreateRacks,
  deleteRacks: mockedDeleteRacks
};

export default USE_MOCKED ? MockedAPI : RealAPI;
