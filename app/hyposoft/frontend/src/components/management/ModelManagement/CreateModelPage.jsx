import React from "react";
import CreateDataForm from "../shared/CreateDataForm";
import { modelSchema } from "./ModelSchema";
import { Typography } from "antd";
import { createModel } from "../../../redux/actions";

function CreateModelPage() {
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Create Model</Typography.Title>
      <CreateDataForm createRecord={createModel} schema={modelSchema} />
    </div>
  );
}

export default CreateModelPage;
