function strcmp(a, b) {
  if (a === b) return 0;
  else return a < b ? -1 : 1;
}

function modelToString(model) {
  return model.vendor + " · " + model.model_number;
}

const instanceSchema = [
  {
    displayName: "Model",
    fieldName: "model",
    type: "model",
    required: true,
    defaultValue: null,
    toString: modelToString,
    sorter: (a, b) => strcmp(modelToString(a.model), modelToString(b.model)),
    sortDirections: ["ascend", "descend"]
  },
  {
    displayName: "Host",
    fieldName: "hostname",
    type: "string",
    required: true,
    defaultValue: "",
    toString: s => s,
    sorter: (a, b) => strcmp(a.hostname, b.hostname),
    sortDirections: ["ascend", "descend"]
  },
  {
    displayName: "Rack",
    fieldName: "rack",
    type: "string",
    required: true,
    defaultValue: "",
    toString: s => s,
    sorter: (a, b) => strcmp(a.rack - b.rack),
    defaultSortOrder: "ascend",
    sortDirections: ["ascend", "descend"]
  },
  {
    displayName: "Rack U",
    fieldName: "rack_u",
    type: "number",
    required: true,
    defaultValue: 0,
    toString: s => s.toString(),
    sorter: (a, b) => a.rack_u - b.rack_u,
    sortDirections: ["ascend", "descend"]
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

export default instanceSchema;
