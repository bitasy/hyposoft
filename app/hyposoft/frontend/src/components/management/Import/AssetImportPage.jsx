import React from "react";
import { Typography, Row, Col, Button, Divider, message, Alert } from "antd";
import VSpace from "../../utility/VSpace";
import { UploadOutlined } from "@ant-design/icons";
import { importAssets } from "../../../api/bulk";
import { useHistory, useLocation } from "react-router-dom";

function AssetImportPage() {
  const history = useHistory();

  const origin = new URLSearchParams(useLocation().search).get("origin");

  const fileInputRef = React.useRef(null);
  const [asset, setAsset] = React.useState([]);
  const [power, setPower] = React.useState([]);
  const [errors, setErrors] = React.useState([]);
  const formData = React.useRef(null);

  function handleImport() {
    fileInputRef.current.click();
  }

  function onFileChange(e) {
    const fd = new FormData();
    fd.append("file", e.target.files[0]);
    formData.current = fd;

    importAssets(fd, false).then(({ status, asset, power, errors }) => {
      if (status === "diff") {
        setErrors([]);
        setAsset(asset);
        setPower(power);
      } else if (status === "error") {
        setErrors(errors.map(({ errors }) => errors));
      } else {
        setErrors([]);
      }
    });

    e.target.value = null;
  }

  function forceUpload() {
    importAssets(formData.current, true).then(({ errors }) => {
      if (errors) {
        setErrors(errors.map(({ errors }) => errors));
      } else {
        message.success("success!");
        history.push(origin);
      }
    });
  }

  const displayForce = errors.length == 0 && formData.current;

  return (
    <div style={{ padding: "16px" }}>
      <Typography.Title level={3}>Import Assets</Typography.Title>
      <VSpace height="16px" />
      <Row>
        <Col md={8}>
          <Button block onClick={handleImport}>
            <UploadOutlined />
            Upload CSV
          </Button>
          <Divider />
        </Col>
      </Row>

      <VSpace height="16px" />

      {asset.length > 0 && (
        <Alert type="info" message={<pre>{asset.join("\n")}</pre>} />
      )}

      <VSpace height="16px" />

      {power.length > 0 && (
        <Alert type="info" message={<pre>{power.join("\n")}</pre>} />
      )}

      <VSpace height="16px" />

      {errors.length > 0 && (
        <Alert type="error" message={<pre>{errors.join("\n")}</pre>} />
      )}

      <VSpace height="16px" />

      {displayForce && (
        <Row>
          <Col md={8}>
            <Button block type="primary" onClick={forceUpload}>
              Confirm changes
            </Button>
          </Col>
        </Row>
      )}

      <input
        accept=".csv"
        type="file"
        hidden
        ref={fileInputRef}
        onChange={onFileChange}
      />
    </div>
  );
}

export default AssetImportPage;
