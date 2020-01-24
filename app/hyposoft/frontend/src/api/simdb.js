export const models = {
  0: {
    id: 0,
    vendor: "Dell",
    model_number: "R710",
    height: 1,
    display_color: "#fcba03",
    ethernet_ports: 2,
    power_ports: 1,
    cpu: "Intel Xeon E5520 2.2GHz",
    memory: 8,
    storage: "2x500GB SSD RAID1",
    comment: "Retired offering, no new purchasing"
  },
  1: {
    id: 1,
    vendor: "Delli",
    model_number: "R100",
    height: 2
  },
  2: {
    id: 2,
    vendor: "Delli",
    model_number: "R100",
    height: 2
  }
};

export const instances = {
  0: {
    id: 0,
    model: 0,
    hostname: "server9",
    rack: 0,
    rack_u: 5,
    owner: "some_owner",
    comment: "Some\nMultiline\nComment"
  },
  1: {
    id: 1,
    model: 1,
    hostname: "server10",
    rack: 1,
    rack_u: 12
  }
};

export const racks = {
  0: {
    id: 0,
    row: "A",
    number: 12
  },
  1: {
    id: 1,
    row: "B",
    number: 12
  }
};
