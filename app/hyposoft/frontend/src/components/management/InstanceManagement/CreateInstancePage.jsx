import React from "react";
import CreateDataForm from "../shared/CreateDataForm";
import API from "../../../api/API";
import { instanceSchema } from "./InstanceSchema";
import { Typography } from "antd";

function CreateInstancePage() {
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Create Instance</Typography.Title>
      <CreateDataForm
        createRecord={API.createInstance}
        schema={instanceSchema}
      />
    </div>
  );
}

export default CreateInstancePage;
