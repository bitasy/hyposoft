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
      onChange={async id => {
        const model = await handleModelSelect(id);
        setFieldValue(
          "network_ports",
          model.network_port_labels.map(label => {
            return {
              label,
              mac_address: null,
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

export default ModelSelect;
