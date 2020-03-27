import React from "react";
import styled from "styled-components";
import Select from "../../../utility/formik/Select";
import Input from "../../../utility/formik/Input";
import VSpace from "../../../utility/VSpace";
import { useField } from "formik";

const BlockHeader = styled("h4")`
  margin: 0;
`;

const BlockText = styled("p")`
  margin: 0;
`;

function NetworkPortSelect({ selectedModel, networkPorts }) {
  return (
    selectedModel &&
    selectedModel.network_port_labels.map((label, idx) => (
      <div key={idx}>
        <VSpace height="8px" />
        <BlockHeader>Label</BlockHeader>
        <Input name={`network_ports.${idx}.label`} disabled />
        <BlockText>MAC address</BlockText>
        <Input name={`network_ports.${idx}.mac_address`} />
        <BlockText>Connection</BlockText>
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
        <VSpace height="8px" />
      </div>
    ))
  );
}

export default NetworkPortSelect;
