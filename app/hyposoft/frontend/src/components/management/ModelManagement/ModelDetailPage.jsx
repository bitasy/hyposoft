import React from "react";
import DataDetailForm from "../shared/DataDetailForm";
import API from "../../../api/API";
import modelSchema from "./ModelSchema";
import { Typography } from "antd";

function ModelDetailPage() {
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Model Details</Typography.Title>
      <DataDetailForm
        getRecord={API.getModel}
        updateRecord={API.updateModel}
        deleteRecord={API.deleteModel}
        schema={modelSchema}
      />
    </div>
  );
}

export default ModelDetailPage;
