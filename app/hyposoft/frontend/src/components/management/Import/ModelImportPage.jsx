import React from "react";
import { importModels } from "../../../api/bulk";
import { Typography, Row, Col, Button, Divider, message, Alert } from "antd";
import VSpace from "../../utility/VSpace";
import { UploadOutlined } from "@ant-design/icons";

function ModelImportPage() {
  const fileInputRef = React.useRef(null);
  const [errors, setErrors] = React.useState([]);

  function handleImport() {
    fileInputRef.current.click();
  }

  function onFileChange(e) {
    const fd = new FormData();
    fd.append("file", e.target.files[0]);
    setErrors([]);
    importModels(fd, true).then(({ status, errors }) => {
      if (status === "success") {
        setErrors([]);
        message.success("success!");
      } else {
        message.error("error");
        setErrors(errors.map(({ errors }) => errors));
      }
    });
    e.target.value = null;
  }

  return (
    <div style={{ padding: "16px" }}>
      <Typography.Title level={3}>Import Models</Typography.Title>
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

      {errors.length > 0 && (
        <Alert type="error" message={<pre>{errors.join("\n")}</pre>} />
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

export default ModelImportPage;
