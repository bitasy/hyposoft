import React from "react";
import { useParams } from "react-router-dom";
import DataDetailForm from "../shared/DataDetailForm";
import { assetSchema } from "./AssetSchema";
import { Typography } from "antd";
import { fetchAsset, updateAsset, removeAsset } from "../../../redux/actions";

function AssetDetailPage() {
  const { id } = useParams();

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
      />
    </div>
  );
}

export default AssetDetailPage;
