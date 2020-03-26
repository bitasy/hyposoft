import React from "react";
import Select from "../../../utility/formik/Select";

function NetworkPortSelect({
  selectedModel,
  networkPorts,
}) {
  return (
    selectedModel &&
    selectedModel.network_port_labels.map((label, idx) => (
      <div key={idx}>
        <span>{label}</span>
        <Input name={`network_ports.${idx}.mac_address`} />
        <Select
          name={`network_ports.${idx}.connection`}
          options={networkPorts.map(
            ({ id, label, mac_address, connection }) => {
              return {
                value: id,
                text: `${label} ${mac_address ?? ""}`,
              };
            },
          )}
        />
      </div>
    ))
  );
}

export default NetworkPortSelect;
