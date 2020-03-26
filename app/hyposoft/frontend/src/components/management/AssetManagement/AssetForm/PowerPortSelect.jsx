import React from "react";
import Select from "../../../utility/formik/Select";
import { useField } from "formik";

function PowerPortSelect({ powerPorts }) {
  const name = "power_connections";
  const [{ value }, {}, { setValue }] = useField(name);

  return (
    <Select
      name={name}
      mode="multiple"
      options={powerPorts.map(({ pdu_id, plug, label }) => {
        return {
          value: { pdu_id, plug },
          text: label,
        };
      })}
      encode={({ pdu_id, plug }) => `${pdu_id},${plug}`}
      decode={s => {
        const [pdu_id, plug] = s.split(",");
        return { pdu_id, plug };
      }}
    />
  );
}

export default PowerPortSelect;
