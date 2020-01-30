import API from "../../../api/API";

function strcmp(a, b) {
  if (a === b) return 0;
  else return a < b ? -1 : 1;
}

function collect(lst, f) {
  return lst.map(f).filter(elm => !!elm);
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
      removeDuplicates(Object.values(state.models).map(m => m.vendor)),
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
    displayName: "Ethernet Ports",
    fieldName: "ethernet_ports",
    type: "number",
    required: false,
    defaultValue: 0,
    min: 0
  },
  {
    displayName: "Power Ports",
    fieldName: "power_ports",
    type: "number",
    required: false,
    defaultValue: 0,
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
    displayName: "Memory",
    fieldName: "memory",
    type: "number",
    required: false,
    defaultValue: 1,
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
    toString: r => r.vendor,
    sorter: (a, b) => strcmp(a.vendor, b.vendor),
    defaultSortOrder: "ascend",
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Model #",
    key: "model_number",
    toString: r => r.model_number,
    sorter: (a, b) => strcmp(a.model_number, b.model_number),
    sortDirections: ["ascend", "descend"]
  },
  {
    title: "Height",
    key: "height",
    toString: s => s.height,
    sorter: (a, b) => a.height - b.height,
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
    fieldName: "keyword",
    type: "text",
    extractDefaultValue: () => "",
    shouldInclude: modelKeywordMatch
  },
  {
    title: "Height",
    fieldName: "height",
    type: "range",
    min: 1,
    max: 42,
    marks: { 1: "1", 42: "42" },
    step: 1,
    extractDefaultValue: records => [
      Math.min(...records.map(r => r.height)),
      Math.max(...records.map(r => r.height))
    ],
    shouldInclude: ([l, r], record) => l <= record.height && record.height <= r
  },
  {
    title: "# of ethernet ports",
    fieldName: "ethernet_ports",
    type: "nullable-range",
    min: 0,
    max: 99,
    marks: { 0: "0", 50: "50", 99: "99" },
    step: 1,
    extractDefaultValue: records => [
      [
        Math.min(...collect(records, r => r.ethernet_ports)),
        Math.max(...collect(records, r => r.ethernet_ports))
      ],
      true
    ],
    shouldInclude: ([[l, r], includeNull], record) =>
      record.ethernet_ports
        ? l <= record.ethernet_ports && record.ethernet_ports <= r
        : includeNull
  },
  {
    title: "# of power ports",
    fieldName: "power_ports",
    type: "nullable-range",
    min: 0,
    max: 10,
    marks: { 0: "0", 10: "10" },
    step: 1,
    extractDefaultValue: records => [
      [
        Math.min(...collect(records, r => r.power_ports)),
        Math.max(...collect(records, r => r.power_ports))
      ],
      true
    ],
    shouldInclude: ([[l, r], includeNull], record) =>
      record.power_ports
        ? l <= record.power_ports && record.power_ports <= r
        : includeNull
  }
];
