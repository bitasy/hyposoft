import React from "react";
import { Typography } from "antd";
import styled from "styled-components";
import { getAssetDetail } from "../../../../api/asset";
import { useParams } from "react-router-dom";
import VSpace from "../../../utility/VSpace";
import NetworkGraph from "../../AssetManagement/AssetForm/NetworkGraph";
import useRedirectOnCPChange from "../../../utility/useRedirectOnCPChange";

// ASSET_DETAILS {
//   id: ASSET_ID,
//   asset_number: number,
//   hostname: string | null,
//   itmodel: ITMODEL,
//   datacenter: DATACENTER,
//   rack: RACK,
//   rack_position: int,
//   decommissioned: bool,
//   decommissioned_by: USER_ID | null, # null if asset not decommissioned
//   decommissioned_timestamp: datetime | null, # null if asset not decommissioned
//   power_connections: {
//     pdu_id: PDU_ID,
//     plug: int,
//     label: string, # ex) L1, R2
//   }[],
//   network_ports: {
//     id: int,
//     label: string,
//     mac_address: string | null,
//     connection: NETWORK_PORT_ID | null,
//     connection_str: string | null, // Some string that represents an asset + network port label
//   }[],
//   network_graph: NETWORK_GRAPH,
//   comment: string | null,
//   owner: USER | null,
//   power_state: "On" | "Off" | null # null for assets that don't have networked pdus connected to it
// }

const Label = styled("span")`
  display: block;
  font-weight: bold;
`;

const Value = styled("span")`
  display: block;
`;

function AssetDetailView() {
  const { id } = useParams();

  const [asset, setAsset] = React.useState(null);

  React.useEffect(() => {
    getAssetDetail(id).then(setAsset);
  }, [id]);

  useRedirectOnCPChange("/decommission");

  if (!asset) return null;

  const {
    asset_number,
    hostname,
    itmodel,
    datacenter,
    rack,
    rack_position,
    decommissioned,
    decommissioned_by,
    decommissioned_timestamp,
    power_connections,
    network_ports,
    network_graph,
    comment,
    owner,
  } = asset;

  const { vendor, model_number } = itmodel;
  const { name: dcName } = datacenter;
  const { rack: rackStr } = rack;
  const powerConnStr = power_connections.map(({ label }) => label).join(", ");

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={4}>Asset Details</Typography.Title>
      <Label>Asset #</Label>
      <Value>{asset_number}</Value>
      <VSpace height="8px" />

      <Label>Hostname</Label>
      <Value>{hostname}</Value>
      <VSpace height="8px" />

      <Label>Model</Label>
      <Value>{`${model_number} by ${vendor}`}</Value>
      <VSpace height="8px" />

      <Label>Location</Label>
      <Value>{`${dcName} ${rackStr}U${rack_position}`}</Value>
      <VSpace height="8px" />

      {decommissioned && (
        <div>
          <Label>Decommissioned By</Label>
          <Value>{decommissioned_by.username}</Value>
          <VSpace height="8px" />

          <Label>Decommissioned At</Label>
          <Value>{decommissioned_timestamp}</Value>
          <VSpace height="8px" />
        </div>
      )}

      <Label>Power connections</Label>
      <Value>{powerConnStr || "(empty)"}</Value>
      <VSpace height="8px" />

      <Label>Network Ports</Label>
      <VSpace height="8px" />
      {network_ports.map(({ label, mac_address, connection_str }, idx) => (
        <div key={idx}>
          <div
            style={{
              display: "inline-block",
              border: "1pt solid #eee",
              padding: 8,
            }}
          >
            <Label>{label}</Label>
            <VSpace height="8px" />

            <Label>MAC Address</Label>
            <Value>{mac_address ?? "(empty)"}</Value>
            <VSpace height="8px" />

            <Label>Connected To</Label>
            <Value>{connection_str ?? "(empty)"}</Value>
          </div>
          <VSpace height="8px" />
        </div>
      ))}

      <Label>Owner</Label>
      <Value>{owner?.username ?? "(empty)"}</Value>
      <VSpace height="8px" />

      <Label>Comment</Label>
      <pre>{comment || "(empty)"}</pre>
      <VSpace height="8px" />

      <Label>Network Graph</Label>
      <NetworkGraph assetID={id} networkGraph={network_graph} />
      <VSpace height="8px" />
    </div>
  );
}

export default AssetDetailView;
