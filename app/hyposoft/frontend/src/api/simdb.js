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
  }
};

export const instances = {
  0: {
    id: 0,
    model: models[0],
    hostname: "server9",
    rack: "B12",
    ract_u: 5,
    owner: "some_owner",
    comment: "Some\nMultiline\nComment"
  },
  1: {
    id: 1,
    model: models[1],
    hostname: "server10",
    rack: "B12",
    ract_u: 12
  }
};
