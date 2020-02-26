import React from "react";
import { useParams } from "react-router-dom";
import DataDetailForm from "../shared/DataDetailForm";
import { assetSchema } from "./AssetSchema";
import { Typography } from "antd";
import {
  updateAsset,
  removeAsset,
  fetchAsset
} from "../../../redux/assets/actions";
import { useSelector, useDispatch } from "react-redux";
import NetworkPowerActionButtons from "./NetworkPowerActionButtons";
import NetworkGraph from "./NetworkGraph";
import { fetchNetworkConnectedPDUs } from "../../../redux/racks/actions";

function AssetDetailPage() {
  const { id } = useParams();

  const dispatch = useDispatch();

  const user = useSelector(s => s.currentUser);
  const assets = useSelector(s => s.assets);

  React.useEffect(() => {
    dispatch(fetchAsset(id));
    dispatch(fetchNetworkConnectedPDUs());
  }, [id]);

  const record = assets[id];

  if (!record) return null;

  return (
    <div style={{ padding: 16 }} key={id}>
      <Typography.Title level={3}>Asset Details</Typography.Title>
      <div style={{ padding: "8px 0" }}>
        <span>Manage power: </span>
        <NetworkPowerActionButtons asset={record} user={user} displayState />
      </div>
      <DataDetailForm
        record={record}
        updateRecord={updateAsset}
        deleteRecord={removeAsset}
        schema={assetSchema}
        disabled={!user.is_staff}
      />
      <NetworkGraph assetID={id} />
    </div>
  );
}

export default AssetDetailPage;
