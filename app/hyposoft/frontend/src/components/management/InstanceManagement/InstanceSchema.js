import {
  modelKeywordMatch,
  modelToString
} from "../ModelManagement/ModelSchema";
import { toIndex } from "../RackManagement/GridUtils";

function strcmp(a, b) {
  if (a === b) return 0;
  else return a < b ? -1 : 1;
}

function instanceToLocation(instance) {
  return `${instance.rack.rack} U${instance.rack_position}`;
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
  },
  {
    title: "Owner",
    key: "owner",
    toString: r => r.owner.username,
    sorter: (a, b) => strcmp(a.owner.username - b.owner.username),
    sortDirections: ["ascend", "descend"]
  }
];

function instanceKeywordMatch(value, record) {
  const lowercase = value.toLowerCase();
  return instanceSchema
    .filter(frag => frag.type === "string" && record[frag.fieldName])
    .map(frag => (record[frag.fieldName] || "").toLowerCase())
    .some(str => str.includes(lowercase));
}

function isInside([minR, maxR, minC, maxC], instance) {
  const [r, c] = toIndex(instance.rack.rack);
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
