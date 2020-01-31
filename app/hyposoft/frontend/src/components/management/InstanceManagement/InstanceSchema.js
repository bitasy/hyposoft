import {
  modelKeywordMatch,
  modelToString,
  modelToDataSource
} from "../ModelManagement/ModelSchema";
import API from "../../../api/API";
import { toIndex, indexToRow } from "../RackManagement/GridUtils";
import { MAX_ROW, MAX_COL } from "../RackManagement/RackManagementPage";

function strcmp(a, b) {
  if (a === b) return 0;
  else return a < b ? -1 : 1;
}

export function rackToString({ row, number }) {
  return row + number;
}

function instanceToLocation(instance) {
  return `${rackToString(instance.rack)} U${instance.rack_u}`;
}

export const instanceSchema = [
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
    required: true,
    defaultValue: ""
  },
  {
    displayName: "Rack",
    fieldName: "rack",
    type: "rack",
    required: true,
    defaultValue: null
  },
  {
    displayName: "Rack U",
    fieldName: "rack_u",
    type: "rack_u",
    required: true,
    defaultValue: null
  },
  {
    displayName: "Owner",
    fieldName: "owner",
    type: "string",
    required: false,
    defaultValue: ""
  },
  {
    displayName: "Comment",
    fieldName: "comment",
    type: "multiline-string",
    required: false,
    defaultValue: ""
  }
];

export const instanceColumns = [
  {
    title: "Model",
    key: "model",
    toString: r => modelToString(r.model),
    sorter: (a, b) => strcmp(modelToString(a.model), modelToString(b.model)),
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Host",
    key: "host",
    toString: r => r.hostname,
    sorter: (a, b) => strcmp(a.hostname, b.hostname),
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Location",
    key: "location",
    toString: r => instanceToLocation(r),
    sorter: (a, b) => strcmp(instanceToLocation(a) - instanceToLocation(b)),
    defaultSortOrder: "ascend",
    sortDirections: ["ascend", "descend"]
  }
];

function instanceKeywordMatch(value, record) {
  const lowercase = value.toLowerCase();
  return instanceSchema
    .filter(frag => frag.type === "string" && record[frag.fieldName])
    .map(frag => record[frag.fieldName].toLowerCase())
    .some(str => str.includes(lowercase));
}

function isInside([minR, maxR, minC, maxC], instance) {
  const [r, c] = toIndex([instance.rack.row, instance.rack.number]);
  return minR <= r && r <= maxR && minC <= c && c <= maxC;
}

export const instanceFilters = [
  {
    title: "Keyword Search (Ignoring case)",
    fieldName: "keyword",
    type: "text",
    extractDefaultValue: () => "",
    shouldInclude: (value, record) => {
      return (
        modelKeywordMatch(value, record.model) ||
        instanceKeywordMatch(value, record)
      );
    }
  },
  {
    title: "Rack",
    fieldName: "rack",
    type: "rack-range",
    extractDefaultValue: records => null,
    shouldInclude: (value, record) => isInside(value, record)
  },
  {
    title: "Rack U",
    fieldName: "rack_u",
    type: "range",
    min: 1,
    max: 42,
    marks: { 1: "1", 42: "42" },
    step: 1,
    extractDefaultValue: records => [
      Math.min(...records.map(r => r.rack_u)),
      Math.max(...records.map(r => r.rack_u))
    ],
    shouldInclude: ([l, r], record) => l <= record.rack_u && record.rack_u <= r
  }
];
