import React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import AssetForm from "./AssetForm/AssetForm";

function AssetDetailPage() {
  const { id } = useParams();

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Asset Details</Typography.Title>
      <AssetForm id={id} />
    </div>
  );
}

export default AssetDetailPage;
