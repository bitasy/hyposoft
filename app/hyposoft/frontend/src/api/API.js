import Axios from "axios";
import produce from "immer";
import { message } from "antd";
import { displayError } from "../global/message";
export const GLOBAL_ABBR = "global";

// Auth APIs
function fetchCurrentUser() {
  return Axios.get("auth/current_user").then(getData);
}

function login(username, password) {
  return withLoading(() =>
    Axios.post("auth/login", { username, password }).then(getData)
  );
}

function logout() {
  // we don't really send out api calls (for now)
  return Axios.post("auth/logout").then(getData);
}

// Model APIs
function translateModel(model) {
  return model;
}

function getModels() {
  return Axios.get("api/equipment/ITModelList")
    .then(getData)
    .then(lst => lst.map(translateModel));
}

function getPaginatedModels(dcName, limit, offset, extra, ordering, direction) {
  const headers = makeHeaders(dcName);
  return Axios.get("api/equipment/ITModelFilter", {
    params: {
      limit,
      offset,
      ...parseFilters(extra),
      ...parseOrderDirection(ordering, direction)
    },
    headers
  })
    .then(getData)
    .then(r => {
      r.results = r.results.map(translateModel);
      return r;
    });
}

function getModel(id) {
  return Axios.get(`api/equipment/ITModelRetrieve/${id}`)
    .then(getData)
    .then(translateModel);
}

async function createModel(fields) {
  fields.network_ports = fields.network_port_labels?.length || 0;
  return withLoading(() =>
    Axios.post(`api/equipment/ITModelCreate`, fields)
      .then(getData)
      .then(model => model.id)
      .then(id =>
        Promise.all(
          (fields.network_port_labels || []).map(v => {
            return createNetworkPortLabel({
              itmodel: id,
              special: null,
              name: v.name
            });
          })
        ).then(() => getModel(id))
      )
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
  return withLoading(() =>
    destroyAllNetworkPortLabels(id)
      .then(() =>
        Promise.all(
          updates.network_port_labels.map(({ name }) =>
            createNetworkPortLabel({
              name,
              special: null,
              itmodel: id
            })
          )
        )
      )
      .then(() => Axios.patch(`api/equipment/ITModelUpdate/${id}`, updates))
      .then(getData)
  );
}

function deleteModel(id) {
  return withLoading(() =>
    Axios.delete(`api/equipment/ITModelDestroy/${id}`).then(getData)
  );
}

// Asset APIs
function translate(asset) {
  Object.assign(asset, { model: asset.itmodel });
  delete asset.itmodel;
  return asset;
}

function getAssets(dcName) {
  const headers = makeHeaders(dcName);
  return Axios.get("api/equipment/AssetList", { headers })
    .then(getData)
    .then(lst => lst.map(translate));
}

function getPaginatedAssets(dcName, limit, offset, extra, ordering, direction) {
  const headers = makeHeaders(dcName);
  return Axios.get("api/equipment/AssetFilter", {
    params: {
      limit,
      offset,
      ...parseFilters(extra),
      ...parseOrderDirection(ordering, direction)
    },
    headers
  })
    .then(getData)
    .then(r => {
      r.results = r.results.map(translate);
      return r;
    });
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
    draft.asset_number = draft.asset_number || 0;
    delete draft.model;
  });

  return withLoading(() =>
    Axios.post(`api/equipment/AssetCreate`, toCreate)
      .then(getData)
      .then(a => a.id)
      .then(id => {
        Promise.all([
          Promise.all(
            fields.power_connections.map(({ pdu_id, position }) =>
              createPowered(position, pdu_id, id)
            )
          ),
          Promise.all(fields.network_ports.map(np => createNetworkPort(id, np)))
        ]).then(() => getAsset(id));
      })
  );
}

// updates has the whole model/rack by itself rather than just model_id and rack.
// so we'll have to double check that here
async function updateAsset(id, updates) {
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

  return withLoading(async () => {
    const prevAsset = await getAsset(id);
    const didModelChange = prevAsset.model.id != patch.itmodel;

    await deleteAllPowered(id).then(() =>
      Promise.all(
        updates.power_connections.map(({ pdu_id, position }) =>
          createPowered(position, pdu_id, id)
        )
      )
    );

    if (didModelChange) {
      await deleteAllNetworkPorts(id); // delete every networkports
      await Promise.all(
        updates.network_ports.map(np => createNetworkPort(id, np))
      ); // and create everything
    } else {
      await Promise.all(
        // Since the current api doesn't support transactions, we have to nullify everything first
        updates.network_ports.map(np => updateNetworkPort(np.id, null))
      );
      await Promise.all(
        updates.network_ports.map(np => updateNetworkPort(np.id, np.connection))
      );
    }

    return Axios.patch(`api/equipment/AssetUpdate/${id}`, patch)
      .then(getData)
      .then(translate);
  });
}

function deleteAsset(id) {
  return withLoading(() =>
    Axios.delete(`api/equipment/AssetDestroy/${id}`)
      .then(getData)
      .then(translate)
  );
}

// Rack APIs
function getRacks(dcName) {
  const headers = makeHeaders(dcName);
  return Axios.get("api/equipment/RackList", { headers }).then(getData);
}

function createRack(rack) {
  return Axios.post("api/equipment/RackCreate", rack)
    .then(getData)
    .catch(() => null);
}

function createRacks(r1, r2, c1, c2, dcID) {
  return withLoading(() => {
    const fromRow = Math.min(r1, r2);
    const toRow = Math.max(r1, r2);
    const fromNumber = Math.min(c1, c2);
    const toNumber = Math.max(c1, c2);

    const toCreate = [];
    for (let i = fromRow; i <= toRow; i++) {
      const row = String.fromCharCode(i + "A".charCodeAt(0));
      for (let j = fromNumber; j <= toNumber; j++) {
        const col = j + 1;
        toCreate.push({
          rack: row + (col < 10 ? "0" : "") + col,
          datacenter: dcID
        });
      }
    }

    return Promise.all(toCreate.map(createRack)).then(removeNulls);
  });
}

function deleteRack(rackID) {
  return Axios.delete(`api/equipment/RackDestroy/${rackID}`)
    .then(getData)
    .catch(err => {
      return { err };
    });
}

function deleteRacks(rackIDs) {
  return withLoading(() =>
    Promise.all(rackIDs.map(deleteRack)).then(removeNullsAndDisplayErrors)
  );
}

// User APIs
function getUsers() {
  return Axios.get("api/users/UserList").then(getData);
}

function removeNulls(arr) {
  return arr.filter(a => a != null);
}

function removeNullsAndDisplayErrors(arr) {
  const errors = arr.filter(a => a.err != null);
  errors.forEach(({ err }) => displayError(err));
  const results = arr.filter(a => a.err == null);
  return results;
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
  return withLoading(() =>
    Axios.post(`api/equipment/DatacenterCreate`, fields).then(getData)
  );
}

function updateDatacenter(id, updates) {
  return withLoading(() =>
    Axios.patch(`api/equipment/DatacenterUpdate/${id}`, updates).then(getData)
  );
}

function deleteDatacenter(id) {
  return withLoading(() =>
    Axios.delete(`api/equipment/DatacenterDestroy/${id}`).then(getData)
  );
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

// Power control APIs
function getPowerState(assetID) {
  return Axios.get(`api/equipment/PDUNetwork/get/${assetID}`).then(getData);
}

function switchPower(assetID, state) {
  return withLoading(() =>
    Axios.post(`api/equipment/PDUNetwork/post`, {
      asset: assetID,
      state
    }).then(getData)
  );
}

function turnOn(assetID) {
  return switchPower(assetID, "on");
}

function turnOff(assetID) {
  return switchPower(assetID, "off");
}

function cycle(assetID) {
  return withLoading(() =>
    Axios.post(`api/equipment/PDUNetwork/cycle`, {
      asset: assetID
    }).then(getData)
  );
}

// Powereds
function createPowered(plugNumber, pduID, assetID) {
  return Axios.post(`api/equipment/PoweredCreate`, {
    plug_number: plugNumber,
    pdu: pduID,
    special: null,
    asset: assetID
  }).then(getData);
}

function deleteAllPowered(assetID) {
  return Axios.delete(`api/equipment/PoweredDeleteByAsset/${assetID}`).then(
    getData // probably null or undefined
  );
}

// Utilities control APIs
function getFreePowerPorts(rackID, assetID) {
  return Axios.get(
    `api/equipment/FreePowerPorts/${rackID}/${assetID || 0}`
  ).then(getData);
}

function getAllNetworkPorts(dcID) {
  return Axios.get(`api/equipment/AllNetworkPorts/${dcID}`).then(getData);
}

function getFreeNetworkPorts(dcID) {
  return Axios.get(`api/equipment/FreeNetworkPorts/${dcID}`).then(getData);
}

function deleteAllNetworkPorts(assetID) {
  return Axios.delete(`api/equipment/NetworkPortDeleteByAsset/${assetID}`).then(
    getData // probably null or undefined
  );
}

function getNetworkConnectedPDUs() {
  return Axios.get("api/equipment/PDUList")
    .then(getData)
    .then(lst => lst.filter(a => a.networked).map(a => a.id));
}

// Network Port APIs
function createNetworkPort(asset_id, fields) {
  /*
  {
    label, 
    connection(null or id)
  }
  */
  return Axios.post("api/equipment/NetworkPortCreate", {
    asset: asset_id,
    label: fields.label.id,
    connection: fields.connection?.id
  }).then(getData);
}

function updateNetworkPort(networkPortID, connection) {
  const connID = connection != null ? connection.id : null;
  return Axios.patch(`api/equipment/NetworkPortUpdate/${networkPortID}`, {
    connection: connID
  }).then(getData);
}

function getNetworkGraph(assetID) {
  return Axios.get(`api/equipment/NetworkGraph/${assetID}`).then(getData);
}

// utility functions

function makeHeaders(dcName) {
  if (dcName && dcName !== GLOBAL_ABBR) {
    return {
      "X-DATACENTER": dcName
    };
  } else {
    return {};
  }
}

async function withLoading(op) {
  const handle = message.loading("Action in progress...", 0);
  try {
    const res = await op();
    message.success("Success!");
    handle();
    return res;
  } catch (e) {
    displayError(e);
    handle();
    return e;
  }
}

function parseOrderDirection(ordering, direction) {
  if (ordering) {
    const orderings = ordering
      .split(",")
      .map(s => direction + s)
      .join(",");
    return { ordering: orderings };
  } else {
    return {};
  }
}

function parseFilters(filters) {
  const ranges = Object.entries(filters)
    .filter(
      ([, f]) => Array.isArray(f) && f.length == 2 && !Array.isArray(f[0])
    )
    .reduce((acc, [fieldName, [min, max]]) => {
      acc[`${fieldName}_min`] = min;
      acc[`${fieldName}_max`] = max;
      return acc;
    }, {});

  const nullableRanges = Object.entries(filters)
    .filter(([, f]) => Array.isArray(f) && f.length == 2 && Array.isArray(f[0]))
    .reduce((acc, [fieldName, [[min, max], includeNull]]) => {
      acc[`${fieldName}`] = `${min},${max},${includeNull}`;
      return acc;
    }, {});

  const values = Object.entries(filters)
    .filter(([, f]) => !Array.isArray(f))
    .reduce((acc, [fieldName, v]) => {
      acc[`${fieldName}`] = v;
      return acc;
    }, {});

  return {
    ...ranges,
    ...nullableRanges,
    ...values
  };
}

//Log API
function getLog(username, displayName, model, identifier, page) {
  username = username ? username : "";
  displayName = displayName ? displayName : "";
  model = model ? model : "";
  identifier = identifier ? identifier : "";

  const query = `log?username__iexact=${username}&display_name__contains=${displayName}&model__iexact=${model}&identifier__contains=${identifier}&page=${page}`;

  return Axios.get(query).then(getData); //returns a list
}

const RealAPI = {
  fetchCurrentUser,
  login,
  logout,

  getModels,
  getPaginatedModels,
  getModel,
  createModel,
  updateModel,
  deleteModel,

  getAssets,
  getPaginatedAssets,
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

  getPowerState,
  turnOn,
  turnOff,
  cycle,

  getFreePowerPorts,
  getFreeNetworkPorts,
  getAllNetworkPorts,
  getNetworkConnectedPDUs,

  getNetworkGraph,

  getUsers,

  getLog
};

export default RealAPI;
