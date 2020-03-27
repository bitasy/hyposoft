import * as Yup from "yup";

export const schema = Yup.object()
  .shape({
    asset_number: Yup.number()
      .min(100000)
      .max(999999)
      .nullable(),
    hostname: Yup.string(),
    itmodel: Yup.number().required(),
    datacenter: Yup.number().required(),
    rack: Yup.number().required(),
    rack_position: Yup.number().required(),
    power_connections: Yup.array(
      Yup.object({
        pdu_id: Yup.number().required(),
        plug: Yup.number().required(),
      }),
    ),
    network_ports: Yup.array(
      Yup.object({
        label: Yup.string().required(),
        mac_address: Yup.string().nullable(),
        connection: Yup.number().nullable(),
      }),
    ),
    comment: Yup.string().nullable(),
    owner: Yup.number().nullable(),
  })
  .default({
    asset_number: null,
    hostname: "",
    itmodel: null,
    datacenter: null,
    rack: null,
    rack_position: null,
    power_connections: [],
    network_ports: [],
    comment: "",
    owner: null,
  });
