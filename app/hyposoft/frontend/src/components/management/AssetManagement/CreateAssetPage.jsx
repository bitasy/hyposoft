import React from "react";
import { Typography, Row, Col } from "antd";
import AssetForm from "./AssetForm/AssetForm";

function CreateAssetPage() {
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>
        Create Model
      </Typography.Title>
      <Row>
        <Col md={8}>
          <AssetForm />
        </Col>
      </Row>
    </div>
  );
}

export default CreateAssetPage;
