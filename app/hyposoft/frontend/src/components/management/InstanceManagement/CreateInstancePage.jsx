import React from "react";
import CreateDataForm from "../shared/CreateDataForm";
import { instanceSchema } from "./InstanceSchema";
import { Typography } from "antd";
import { createInstance } from "../../../redux/actions";

function CreateInstancePage() {
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Create Instance</Typography.Title>
      <CreateDataForm createRecord={createInstance} schema={instanceSchema} />
    </div>
  );
}

export default CreateInstancePage;
