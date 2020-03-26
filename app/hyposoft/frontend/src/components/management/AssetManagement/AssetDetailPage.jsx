import React from "react";
import { useParams } from "react-router-dom";
import { Typography, Row, Col } from "antd";
import VSpace from "../../utility/VSpace";
import AssetForm from "./AssetForm/AssetForm";

function AssetDetailPage() {
  const { id } = useParams();

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>
        Model Details
      </Typography.Title>
      <Row>
        <Col md={8}>
          <AssetForm id={id} />
        </Col>
      </Row>
    </div>
  );
}

export default AssetDetailPage;
