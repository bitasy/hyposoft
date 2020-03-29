import React from "react";
import { Typography, Row, Col, Button, Divider } from "antd";
import VSpace from "../../utility/VSpace";
import { UploadOutlined } from "@ant-design/icons";
import { importModels } from "../../../api/bulk";
import Diff from "../../utility/Diff";

function ModelImportPage() {
  const fileInputRef = React.useRef(null);
  const [headers, setHeaders] = React.useState(null);
  const [diff, setDiff] = React.useState(null);
  const buf = React.useRef(null);

  function handleImport() {
    fileInputRef.current.click();
  }

  function onFileChange(e) {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const array = new Uint8Array(arrayBuffer);
      buf.current = array;
      importModels(array, false).then(({ headers, diff }) => {
        setHeaders(headers);
        setDiff(diff);
      });
    };
    reader.readAsArrayBuffer(e.target.files[0]);

    e.target.value = null;
  }

  function forceUpload() {
    importModels(buf.current, true).then(({ headers, diff }) => {
      setHeaders(headers);
      setDiff(diff);
    });
  }

  const displayForce =
    buf.current &&
    diff.some(({ warning }) => !!warning) &&
    diff.every(({ error }) => !error);

  return (
    <div style={{ padding: "16px" }}>
      <Typography.Title level={3}>Import Models</Typography.Title>
      <VSpace height="16px" />
      <Row>
        <Col md={8}>
          <Button block onClick={handleImport}>
            <UploadOutlined />
            Import from csv
          </Button>
          <Divider />
        </Col>
      </Row>
      {headers && diff && <Diff headers={headers} diff={diff} />}
      {displayForce && (
        <Row>
          <Col md={8}>
            <Button block type="primary" onClick={forceUpload}>
              Continue with warnings
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

export default ModelImportPage;
