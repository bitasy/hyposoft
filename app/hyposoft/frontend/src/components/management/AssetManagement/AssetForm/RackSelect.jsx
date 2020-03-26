import React from "react";
import Select from "../../../utility/formik/Select";
import { useFormikContext } from "formik";
import { getModelPicklist } from "../../../../api/model";

function RackSelect({ rackList, handleRackSelect }) {
  const { setFieldValue } = useFormikContext();

  React.useEffect(() => {
    getModelPicklist().then(setModelPickList);
  }, []);

  return (
    <Select
      name="rack"
      options={rackList.map(({ id, rack }) => {
        return { value: id, text: rack };
      })}
      onChange={id => {
        handleRackSelect(id);
        setFieldValue("power_connections", []);
      }}
    />
  );
}

export default RackSelect;
