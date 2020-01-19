function strcmp(a, b) {
  if (a === b) return 0;
  else return a < b ? -1 : 1;
}

function modelToString(model) {
  return model.vendor + " · " + model.model_number;
}

function instanceToLocation(instance) {
  return instance.rack + " U" + instance.rack_u;
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
    type: "string",
    required: true,
    defaultValue: ""
  },
  {
    displayName: "Rack U",
    fieldName: "rack_u",
    type: "number",
    required: true,
    defaultValue: 0
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
