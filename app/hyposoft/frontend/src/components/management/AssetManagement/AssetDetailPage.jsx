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
import { useSelector } from "react-redux";

function AssetDetailPage() {
  const { id } = useParams();

  const isAdmin = useSelector(s => s.currentUser.is_superuser);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Asset Details</Typography.Title>
      <DataDetailForm
        id={id}
        selector={(s, id) => s.assets[id]}
        getRecord={fetchAsset}
        updateRecord={updateAsset}
        deleteRecord={removeAsset}
        schema={assetSchema}
        disabled={!isAdmin}
      />
    </div>
  );
}

export default AssetDetailPage;
