import React from "react";
import Select from "../../../utility/formik/Select";
import { useFormikContext } from "formik";

function ModelSelect({ modelPickList, handleModelSelect }) {
  const { setFieldValue } = useFormikContext();

  return (
    <Select
      name="itmodel"
      options={modelPickList.map(({ id, str }) => {
        return { value: id, text: str };
      })}
      onChange={id => {
        handleModelSelect(id);
        setFieldValue("network_ports", [], false);
        setFieldValue("power_connections", [], false);
      }}
    />
  );
}

export default ModelSelect;
