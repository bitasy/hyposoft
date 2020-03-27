import React from "react";
import { Typography, Row, Col } from "antd";
import AssetForm from "./AssetForm/AssetForm";

function CreateAssetPage() {
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Create Asset</Typography.Title>
      <AssetForm />
    </div>
  );
}

export default CreateAssetPage;
