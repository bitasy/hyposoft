import React from "react";
import Select from "../../../utility/formik/Select";
import { useFormikContext } from "formik";

function DatacenterSelect({ dcList, handleDCSelect }) {
  const { setFieldValue } = useFormikContext();

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
        setFieldValue("network_ports", [], false);
        setFieldValue("power_connections", [], false);
      }}
    />
  );
}

export default DatacenterSelect;
