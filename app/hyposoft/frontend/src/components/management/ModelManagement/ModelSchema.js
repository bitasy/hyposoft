function strcmp(a, b) {
  if (a === b) return 0;
  else return a < b ? -1 : 1;
}

const modelSchema = [
  {
    displayName: "Vendor",
    fieldName: "vendor",
    type: "string",
    required: true,
    defaultValue: "",
    toString: s => s,
    sorter: (a, b) => strcmp(a.vendor, b.vendor),
    defaultSortOrder: "ascend",
    sortDirections: ["ascend", "descend"]
  },
  {
    displayName: "Model #",
    fieldName: "model_number",
    type: "string",
    required: true,
    defaultValue: "",
    toString: s => s,
    sorter: (a, b) => strcmp(a.model_number, b.model_number),
    sortDirections: ["ascend", "descend"]
  },
  {
    displayName: "Height",
    fieldName: "height",
    type: "number",
    required: true,
    defaultValue: 1,
    toString: s => s.toString(),
    min: 1,
    sorter: (a, b) => a.height - b.height,
    sortDirections: ["ascend", "descend"]
  },
  {
    displayName: "Display Color",
    fieldName: "display_color",
    type: "color-string",
    required: false,
    defaultValue: "#1ff2eb"
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

export default modelSchema;
