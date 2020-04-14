import React from "react";
import { Typography } from "antd";
import styled from "styled-components";
import { getAssetDetail } from "../../../../api/asset";
import { useParams } from "react-router-dom";
import VSpace from "../../../utility/VSpace";
import NetworkGraph from "../../AssetManagement/AssetForm/NetworkGraph";
import useRedirectOnCPChange from "../../../utility/useRedirectOnCPChange";

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
    location,
    decommissioned,
    decommissioned_by,
    decommissioned_timestamp,
    power_connections,
    network_ports,
    network_graph,
    comment,
    owner,
  } = asset;

  const { vendor, model_number, type } = itmodel;
  const { tag, site } = location;
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
      {tag === "rack-mount" ? (
        <Value>{`${location.site.abbr} ${location.rack.rack} U${location.rack_position}`}</Value>
      ) : tag === "chassis-mount" ? (
        <Value>{`${location.site.abbr} ${location.asset_hostname ?? ""} #${
          location.asset.asset_number
        } SLOT ${location.slot}`}</Value>
      ) : tag === "offline" ? (
        <Value>{`${location.site.abbr}`}</Value>
      ) : null}
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

      {type !== "blade" ? (
        <div>
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
        </div>
      ) : null}

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
