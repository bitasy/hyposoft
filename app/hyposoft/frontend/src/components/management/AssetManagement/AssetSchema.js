import {
  modelKeywordMatch,
  modelToString
} from "../ModelManagement/ModelSchema";
import { toIndex } from "../RackManagement/GridUtils";

function strcmp(a, b) {
  if (a === b) return 0;
  else return a < b ? -1 : 1;
}

function assetToLocation(asset) {
  return `${asset.rack.rack} U${asset.rack_position}`;
}

export const assetSchema = [
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
    toString: r => assetToLocation(r),
    sorter: (a, b) => strcmp(assetToLocation(a) - assetToLocation(b)),
    defaultSortOrder: "ascend",
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Owner",
    key: "owner",
    toString: r => r.owner.username,
    sorter: (a, b) => strcmp(a.owner.username - b.owner.username),
    sortDirections: ["ascend", "descend"]
  }
];

function assetKeywordMatch(value, record) {
  const lowercase = value.toLowerCase();
  return assetSchema
    .filter(frag => frag.type === "string" && record[frag.fieldName])
    .map(frag => (record[frag.fieldName] || "").toLowerCase())
    .some(str => str.includes(lowercase));
}

function isInside([minR, maxR, minC, maxC], asset) {
  const [r, c] = toIndex(asset.rack.rack);
  return minR <= r && r <= maxR && minC <= c && c <= maxC;
}

export const assetFilters = [
  {
    title: "Keyword Search (Ignoring case)",
    fieldName: "keyword",
    type: "text",
    extractDefaultValue: () => "",
    shouldInclude: (value, record) => {
      return (
        modelKeywordMatch(value, record.model) ||
        assetKeywordMatch(value, record)
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
    title: "Rack Position",
    fieldName: "rack_position",
    type: "range",
    min: 1,
    max: 42,
    marks: { 1: "1", 42: "42" },
    step: 1,
    extractDefaultValue: records => [
      Math.min(...records.map(r => r.rack_position)),
      Math.max(...records.map(r => r.rack_position))
    ],
    shouldInclude: ([l, r], record) =>
      l <= record.rack_position && record.rack_position <= r
  }
];
