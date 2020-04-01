import React from "react";
import styled from "styled-components";
import Select, { RawSelect } from "../../../utility/formik/Select";
import Input from "../../../utility/formik/Input";
import VSpace from "../../../utility/VSpace";
import { useFormikContext } from "formik";
import { getAssetPicklist, networkPortList } from "../../../../api/asset";

const BlockHeader = styled("h4")`
  margin: 0;
`;

const BlockText = styled("p")`
  margin: 0;
`;

function NetworkPortSelect({ asset }) {
  return (
    asset &&
    asset.network_ports.map(
      ({ label, mac_address, asset_str, connection }, idx) => (
        <div key={idx}>
          <VSpace height="8px" />
          <BlockHeader>Label: {label}</BlockHeader>
          <BlockText>MAC address</BlockText>
          <Input name={`network_ports.${idx}.mac_address`} />
          <AssetNetworkPortSelect
            idx={idx}
            id={asset.id}
            asset_str={asset_str}
          />
          <VSpace height="8px" />
        </div>
      ),
    )
  );
}

function AssetNetworkPortSelect({ idx, id, asset_str }) {
  const { values, setFieldValue } = useFormikContext();

  const [networkPorts, setNetworkPorts] = React.useState([]);
  const [assetList, setAssetList] = React.useState([]);
  const [selectedAsset, setSelectedAsset] = React.useState(null);

  React.useEffect(() => {
    if (values?.datacenter) {
      getAssetPicklist({
        datacenter_id: values.datacenter,
        asset_id: id,
      }).then(setAssetList);
      networkPortList().then(setNetworkPorts);
    }
  }, [values?.datacenter]);

  React.useEffect(() => {
    if (selectedAsset) {
      networkPortList(selectedAsset).then(setNetworkPorts);
    }
  }, [selectedAsset]);

  React.useEffect(() => {
    // Should really be setting this to the connection id (just connection above)
    // But for some reason this is the only way to get the detail page to load correctly
    setSelectedAsset(asset_str);
  });

  return (
    <div>
      <BlockText>Connection (asset)</BlockText>
      <RawSelect
        allowClear
        value={selectedAsset}
        onChange={id => {
          setSelectedAsset(id);
          setFieldValue(`network_ports.${idx}.connection`, null, false);
        }}
        options={assetList.map(({ id, hostname, asset_number }) => {
          return { value: id, text: hostname ?? asset_number };
        })}
      />
      <BlockText>Connection (port)</BlockText>
      <Select
        allowClear
        name={`network_ports.${idx}.connection`}
        options={networkPorts.map(({ id, label, mac_address }) => {
          return {
            value: id,
            text: `${label} ${mac_address ?? ""}`,
          };
        })}
      />
    </div>
  );
}

export default NetworkPortSelect;
