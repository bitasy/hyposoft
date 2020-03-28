import React from "react";
import Select from "../../../utility/formik/Select";
import { useFormikContext } from "formik";

function DatacenterSelect({ dcList, handleDCSelect }) {
  const { setFieldValue, values } = useFormikContext();

  return (
    <Select
      name="datacenter"
      options={dcList.map(({ id, abbr, name }) => {
        return { value: id, text: name };
      })}
      onChange={id => {
        handleDCSelect(id);
        setFieldValue("rack", null, false);
        setFieldValue("rack_position", null, false);
        setFieldValue(
          "network_ports",
          values.network_ports.map(p => {
            return {
              ...p,
              connection: null,
            };
          }),
          false,
        );
        setFieldValue("power_connections", [], false);
      }}
    />
  );
}

export default DatacenterSelect;
