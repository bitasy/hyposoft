import React from "react";
import { modelToString } from "../ModelManagement/ModelSchema";
import NetworkPowerActionButtons from "./NetworkPowerActionButtons";

function strcmp(a, b) {
  if (a === b) return 0;
  else return a < b ? -1 : 1;
}

function assetToLocation(asset) {
  return `${asset.dcName} ${asset.rack.rack} U${asset.rack_position}`;
}

export const assetSchema = [
  {
    displayName: "Asset Number",
    fieldName: "asset_number",
    type: "autogen-number",
    required: false,
    defaultValue: null,
    min: 100001,
    max: 999999
  },
  {
    displayName: "Model",
    fieldName: "model",
    type: "model",
    required: true,
    defaultValue: null
  },
  {
    displayName: "Host",
    fieldName: "hostname",
    type: "string",
    required: false,
    defaultValue: ""
  },
  {
    displayName: "Datacenter",
    fieldName: "datacenter",
    type: "datacenter",
    required: true,
    defaultValue: null
  },
  {
    displayName: "Rack",
    fieldName: "rack",
    type: "rack",
    required: true,
    defaultValue: null
  },
  {
    displayName: "Rack position",
    fieldName: "rack_position",
    type: "rack_position",
    required: true,
    defaultValue: null
  },
  {
    displayName: "Owner",
    fieldName: "owner",
    type: "user",
    required: false,
    defaultValue: ""
  },
  {
    displayName: "Mac Address",
    fieldName: "mac_address",
    type: "string",
    required: false,
    defaultValue: ""
  },
  {
    displayName: "Network connections",
    fieldName: "network_ports",
    type: "network-port",
    required: false,
    defaultValue: null
  },
  {
    displayName: "Power connections",
    fieldName: "power_connections",
    type: "power-connection",
    required: false,
    defaultValue: []
  },
  {
    displayName: "Comment",
    fieldName: "comment",
    type: "multiline-string",
    required: false,
    defaultValue: ""
  }
];

export const assetColumns = [
  {
    title: "Model",
    key: "model",
    render: r => modelToString(r.model),
    sorter: (a, b) => strcmp(modelToString(a.model), modelToString(b.model)),
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Host",
    key: "host",
    render: r => r.hostname,
    sorter: (a, b) => strcmp(a.hostname, b.hostname),
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Location",
    key: "location",
    render: r => assetToLocation(r),
    sorter: (a, b) => strcmp(assetToLocation(a) - assetToLocation(b)),
    defaultSortOrder: "ascend",
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Owner",
    key: "owner",
    render: r => r.owner.username,
    sorter: (a, b) => strcmp(a.owner.username - b.owner.username),
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Power",
    key: "actions",
    render: (r, user) => {
      return <NetworkPowerActionButtons asset={r} user={user} />;
    },
    sorter: null,
    sortDirections: []
  }
];

export const assetFilters = [
  {
    title: "Keyword Search (Ignoring case)",
    fieldName: "search",
    type: "text",
    extractDefaultValue: () => ""
  },
  {
    title: "Rack",
    fieldName: "rack__rack",
    type: "rack-range",
    extractDefaultValue: () => ["A01", "Z99"]
  },
  {
    title: "Rack Position",
    fieldName: "rack_position",
    type: "range",
    min: 1,
    max: 42,
    marks: { 1: "1", 42: "42" },
    step: 1,
    extractDefaultValue: () => [1, 42]
  }
];
