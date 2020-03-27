import React from "react";
import Select from "../../../utility/formik/Select";
import { useFormikContext } from "formik";

function RackSelect({ rackList, handleRackSelect }) {
  const { setFieldValue } = useFormikContext();

  return (
    <Select
      name="rack"
      options={rackList.map(({ id, rack }) => {
        return { value: id, text: rack };
      })}
      onChange={id => {
        handleRackSelect(id);
        setFieldValue("power_connections", [], false);
      }}
    />
  );
}

export default RackSelect;
