function strcmp(a, b) {
  if (a === b) return 0;
  else return a < b ? -1 : 1;
}

function removeDuplicates(arr) {
  return Array.from(new Set(arr));
}

export function modelToString(model) {
  return model.vendor + " · " + model.model_number;
}

export function modelToDataSource(model) {
  // https://github.com/ant-design/ant-design/blob/1bf0bab2a7bc0a774119f501806e3e0e3a6ba283/components/auto-complete/index.tsx#L11
  return {
    text: modelToString(model),
    value: model
  };
}

export const DEFAULT_COLOR_VALUE = "#ddd";

export const modelSchema = [
  {
    displayName: "Vendor",
    fieldName: "vendor",
    type: "string",
    extractDataSource: state =>
      removeDuplicates(Object.values(state.models).map(m => m.vendor)).sort(),
    required: true,
    defaultValue: ""
  },
  {
    displayName: "Model #",
    fieldName: "model_number",
    type: "string",
    required: true,
    defaultValue: ""
  },
  {
    displayName: "Height",
    fieldName: "height",
    type: "number",
    required: true,
    defaultValue: 1,
    min: 1
  },
  {
    displayName: "Display Color",
    fieldName: "display_color",
    type: "color-string",
    required: false,
    defaultValue: DEFAULT_COLOR_VALUE
  },
  {
    displayName: "Network Ports",
    fieldName: "network_port_labels",
    type: "network_port_labels",
    required: false,
    defaultValue: null
  },
  {
    displayName: "Power Ports",
    fieldName: "power_ports",
    type: "number",
    required: false,
    defaultValue: null,
    min: 0
  },
  {
    displayName: "CPU",
    fieldName: "cpu",
    type: "string",
    required: false,
    defaultValue: ""
  },
  {
    displayName: "Memory (In GBs)",
    fieldName: "memory",
    type: "number",
    required: false,
    defaultValue: null,
    min: 0
  },
  {
    displayName: "Storage",
    fieldName: "storage",
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

export const modelColumns = [
  {
    title: "Vendor",
    key: "vendor",
    api_field: "vendor",
    render: r => r.vendor,
    sorter: true,
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Model #",
    key: "model_number",
    api_field: "model_number",
    render: r => r.model_number,
    sorter: true,
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Height",
    key: "height",
    api_field: "height",
    render: s => s.height,
    sorter: true,
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Display Color",
    key: "display_color",
    api_field: "display_color",
    render: s => s.display_color,
    sorter: true,
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Network Ports",
    key: "network_ports",
    api_field: "network_ports",
    render: s => (s.network_ports || "").toString(),
    sorter: true,
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Power Ports",
    key: "power_ports",
    api_field: "power_ports",
    render: s => (s.power_ports || "").toString(),
    sorter: true,
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "CPU",
    key: "cpu",
    api_field: "cpu",
    render: s => s.cpu,
    sorter: true,
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Memory",
    key: "memory",
    api_field: "memory",
    render: s => (s.memory || "").toString(),
    sorter: true,
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Storage",
    key: "storage",
    api_field: "storage",
    render: s => s.storage,
    sorter: true,
    sortDirections: ["ascend", "descend"]
  }
];

export function modelKeywordMatch(value, record) {
  const lowercase = value.toLowerCase();
  return modelSchema
    .filter(frag => frag.type === "string" && record[frag.fieldName])
    .map(frag => record[frag.fieldName].toLowerCase())
    .some(str => str.includes(lowercase));
}

export const modelFilters = [
  {
    title: "Keyword Search (Ignoring case)",
    fieldName: "search",
    type: "text",
    extractDefaultValue: () => ""
  },
  {
    title: "Height",
    fieldName: "height",
    type: "range",
    min: 1,
    max: 42,
    marks: { 1: "1", 42: "42" },
    step: 1,
    extractDefaultValue: () => [1, 42]
  },
  {
    title: "# of Network Ports",
    fieldName: "network_ports",
    //type: "nullable-range",
    type: "range",
    min: 0,
    max: 100,
    marks: { 0: "0", 100: "100" },
    step: 10,
    extractDefaultValue: () => [[0, 100], true]
  },
  {
    title: "# of Power Ports",
    fieldName: "power_ports",
    //type: "nullable-range",
    type: "range",
    min: 0,
    max: 10,
    marks: { 0: "0", 10: "10" },
    step: 1,
    extractDefaultValue: () => [[0, 10], true]
  }
];
