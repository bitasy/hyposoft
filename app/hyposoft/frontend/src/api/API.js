import Cookies from "js-cookie";
import * as Axios from "axios";

import { models, instances } from "./simdb";

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
  return Promise.resolve(Object.values(instances));
}

function getInstancesForRack(rackID) {
  return Axios.get(`${rackID}`);
}

function mockedGetInstancesForRack(rackID) {
  return Promise.resolve(
    Object.values(instances).filter(instance => instance.rack === rackID)
  );
}

function getInstance(id) {
  return Axios.get(`${id}`);
}

function mockedGetInstance(id) {
  return Promise.resolve(instances[id]);
}

function createInstance(fields) {
  return Axios.post("", fields);
}

function mockedCreateInstance(fields) {
  const newID = Object.keys(instances).length;
  instances[newID] = {
    id: newID,
    ...fields,
    model: models[fields.model]
  };
  return Promise.resolve(newID);
}

function updateInstance(id, updates) {
  return Axios.patch(`${id}`, updates);
}

function mockedUpdateInstance(id, updates) {
  Object.assign(instances[id], updates);
  return Promise.resolve(instances[id]);
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
  return Promise.resolve(
    Object.values(instances).reduce((acc, instance) => {
      const arr = acc[instance.rack] || [];
      arr.push(instance);
      acc[instance.rack] = arr;
      return acc;
    }, {})
  );
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

  getRacks
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

  getRacks: mockedGetRacks
};

export default USE_MOCKED ? MockedAPI : RealAPI;
