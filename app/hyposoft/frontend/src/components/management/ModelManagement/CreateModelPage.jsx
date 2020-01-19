import React from "react";
import CreateDataForm from "../shared/CreateDataForm";
import API from "../../../api/API";
import { modelSchema } from "./ModelSchema";
import { Typography } from "antd";

function CreateModelPage() {
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Create Model</Typography.Title>
      <CreateDataForm createRecord={API.createModel} schema={modelSchema} />
    </div>
  );
}

export default CreateModelPage;
