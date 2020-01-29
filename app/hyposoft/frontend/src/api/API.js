import Cookies from "js-cookie";
import Axios from "axios";
import { message } from "antd";

import { models, instances, racks } from "./simdb";

const USE_MOCKED = false;

export const SESSION_COOKIE_NAME = "whatever_for_now"; // maybe not

// Auth APIs
function login(username, password) {
  return Axios.post(createURL(""), { username, password })
    .then(getData)
    .catch(displayError);
}

function mockedLogin() {
  Cookies.set(SESSION_COOKIE_NAME, "mocked session cookie");
  return Promise.resolve();
}

function logout() {
  return Axios.post(createURL(""))
    .then(getData)
    .catch(displayError);
}

function mockedLogout() {
  Cookies.remove(SESSION_COOKIE_NAME);
  return Promise.resolve();
}

// Model APIs
function getModels() {
  return Axios.get(createURL("ITModelList"))
    .then(getData)
    .catch(displayError);
}

function mockedGetModels() {
  return Promise.resolve(Object.values(models));
}

function getModel(id) {
  return Axios.get(createURL(`ITModelRetrieve/${id}`))
    .then(getData)
    .catch(displayError);
}

function mockedGetModel(id) {
  return Promise.resolve(models[id]);
}

function createModel(fields) {
  return Axios.post(createURL(`ITModelCreate`), fields)
    .then(getData)
    .catch(displayError);
}

function mockedCreateModel(fields) {
  const newID = Object.keys(models).length;
  models[newID] = { id: newID, ...fields };
  return Promise.resolve(newID);
}

function updateModel(id, updates) {
  return Axios.patch(createURL(`ITModelUpdate/${id}`), updates)
    .then(getData)
    .catch(displayError);
}

function mockedUpdateModel(id, updates) {
  Object.assign(models[id], updates);
  return Promise.resolve(models[id]);
}

function deleteModel(id) {
  return Axios.delete(createURL(`ITModelDestroy/${id}`))
    .then(getData)
    .catch(displayError);
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

function translate(instance) {
  Object.assign(instance, { model: instance.itmodel });
  delete instance.itmodel;
  return instance;
}

function getInstances() {
  return Axios.get(createURL("InstanceList"))
    .then(getData)
    .then(instances => instances.map(translate))
    .catch(displayError);
}

function mockedGetInstances() {
  return Promise.all(Object.keys(instances).map(mockedGetInstance));
}

// ex) A12
function getInstancesForRack(rackID) {
  return getInstances()
    .then(instances => instances.filter(inst => inst.rack.id === rackID))
    .catch(displayError);
}

function mockedGetInstancesForRack(rackID) {
  return mockedGetInstances().then(instances =>
    instances.filter(instance => instance.rack.id === rackID)
  );
}

function getInstance(id) {
  return Axios.get(createURL(`InstanceRetrieve/${id}`))
    .then(getData)
    .then(translate)
    .catch(displayError);
}

function mockedGetInstance(id) {
  return Promise.resolve({
    ...instances[id],
    model: models[instances[id].model],
    rack: racks[instances[id].rack]
  });
}

function createInstance(fields) {
  Object.assign(fields, {
    itmodel: fields.model.id,
    rack: fields.rack.id
  });
  delete fields.model;

  return Axios.post(createURL(`InstanceCreate`), fields)
    .then(getData)
    .catch(displayError);
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

// updates has the whole model/rack by itself rather than just model_id and rack.
// so we'll have to double check that here
function updateInstance(id, updates) {
  Object.assign(
    updates,
    updates.model ? { itmodel: updates.model.id } : {},
    updates.rack ? { rack: updates.rack.id } : {}
  );
  delete updates.model;

  return Axios.patch(createURL(`InstanceUpdate/${id}`), updates)
    .then(getData)
    .catch(displayError);
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
  return Axios.delete(createURL(`InstanceDestroy/${id}`))
    .then(getData)
    .catch(displayError);
}

function mockedDeleteInstance(id) {
  const toRemove = instances[id];
  delete instances[id];
  return Promise.resolve(toRemove);
}

// Rack APIs
function getRacks() {
  return Axios.get(createURL("RackList"))
    .then(getData)
    .catch(displayError);
}

function mockedGetRacks() {
  return Promise.resolve(Object.values(racks));
}

function createRack(rack) {
  return Axios.post(createURL("RackCreate"), rack)
    .then(getData)
    .catch(displayError);
}

function createRacks(fromRow, toRow, fromNumber, toNumber) {
  const toCreate = [];
  for (let i = fromRow.charCodeAt(0); i <= toRow.charCodeAt(0); i++) {
    const row = String.fromCharCode(i);
    for (let j = fromNumber; j <= toNumber; j++) {
      toCreate.push({
        row,
        number: j
      });
    }
  }

  return Promise.all(toCreate.map(createRack));
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

function deleteRack(rackID) {
  return Axios.delete(createURL(`RackDestroy/${rackID}`))
    .then(getData)
    .catch(displayError);
}

function deleteRacks(rackIDs) {
  return Promise.all(rackIDs.map(deleteRack));
}

function mockedDeleteRacks(rackIDs) {
  const deleted = [];

  Object.keys(racks).map(id => {
    if (rackIDs.includes(parseInt(id))) {
      deleted.push(racks[id]);
      delete racks[id];
    }
  });

  return Promise.resolve(deleted);
}

function displayError(error) {
  message.error(error.message);
}

function createURL(path) {
  return `api/equipment/${path}`;
}

function getData(res) {
  return res.data;
}

function probe(r) {
  console.log(r);
  return r;
}

const RealAPI = {
  login: mockedLogin,
  logout: mockedLogout,

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
