import React from "react";
import Select from "../../../utility/formik/Select";
import { useFormikContext } from "formik";

function SiteSelect({ siteList, handleSiteSelect, type }) {
  const { setFieldValue, values } = useFormikContext();

  return (
    <Select
      name="location.site"
      options={siteList
        .filter(({ type: stype }) => stype === type)
        .map(({ id, name }) => {
          return { value: id, text: `${name}` };
        })}
      onChange={id => {
        handleSiteSelect(id);

        if (type === "rack-mount") {
          setFieldValue("location.rack", null, false);
          setFieldValue("location.rack_position", null, false);
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
        } else if (type === "chassis-mount") {
          setFieldValue("location.asset", null, false);
          setFieldValue("location.slot", null, false);
        }
      }}
    />
  );
}

export default SiteSelect;
