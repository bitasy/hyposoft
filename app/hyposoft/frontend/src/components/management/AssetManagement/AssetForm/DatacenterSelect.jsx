import React from "react";
import Select from "../../../utility/formik/Select";
import { useFormikContext } from "formik";

function DatacenterSelect({ dcList, handleDCSelect }) {
  const { setFieldValue } = useFormikContext();

  return (
    <Select
      name="itmodel"
      options={dcList.map(({ id, abbr, name }) => {
        return { value: id, text: name };
      })}
      onChange={id => {
        handleDCSelect(id);
        setFieldValue("rack", null);
        setFieldValue("rack_position", null);
        setFieldValue("network_ports", []);
        setFieldValue("power_connections", []);
      }}
    />
  );
}

export default DatacenterSelect;
