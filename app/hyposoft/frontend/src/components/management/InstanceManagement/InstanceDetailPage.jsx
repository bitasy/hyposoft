import React from "react";
import { useParams } from "react-router-dom";
import DataDetailForm from "../shared/DataDetailForm";
import API from "../../../api/API";
import { instanceSchema } from "./InstanceSchema";
import { Typography } from "antd";

function InstanceDetailPage() {
  const { id } = useParams();

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Instance Details</Typography.Title>
      <DataDetailForm
        id={id}
        getRecord={API.getInstance}
        updateRecord={API.updateInstance}
        deleteRecord={API.deleteInstance}
        schema={instanceSchema}
      />
    </div>
  );
}

export default InstanceDetailPage;
