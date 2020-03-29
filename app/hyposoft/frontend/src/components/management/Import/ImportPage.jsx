import React from "react";
import { Typography, Row, Col, Button, Divider } from "antd";
import VSpace from "../../utility/VSpace";
import { UploadOutlined } from "@ant-design/icons";
import Diff from "../../utility/Diff";

function ImportPage({ importFn, name }) {
  const fileInputRef = React.useRef(null);
  const [headers, setHeaders] = React.useState(null);
  const [diff, setDiff] = React.useState(null);
  const formData = React.useRef(null);

  function handleImport() {
    fileInputRef.current.click();
  }

  function onFileChange(e) {
    const fd = new FormData();
    fd.append("file", e.target.files[0]);
    formData.current = fd;

    importFn(fd, false).then(({ headers, diff }) => {
      setHeaders(headers);
      setDiff(diff);
    });

    e.target.value = null;
  }

  function forceUpload() {
    importFn(formData.current, true).then(({ headers, diff }) => {
      setHeaders(headers);
      setDiff(diff);
    });
  }

  const displayForce =
    formData.current &&
    diff.some(({ warning }) => !!warning) &&
    diff.every(({ error }) => !error);

  return (
    <div style={{ padding: "16px" }}>
      <Typography.Title level={3}>Import {name}</Typography.Title>
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

export default ImportPage;
