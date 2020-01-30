import React from "react";
import { useParams } from "react-router-dom";
import DataDetailForm from "../shared/DataDetailForm";
import { instanceSchema } from "./InstanceSchema";
import { Typography } from "antd";
import {
  fetchInstance,
  updateInstance,
  removeInstance
} from "../../../redux/actions";

function InstanceDetailPage() {
  const { id } = useParams();

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Instance Details</Typography.Title>
      <DataDetailForm
        id={id}
        selector={(s, id) => s.instances[id]}
        getRecord={fetchInstance}
        updateRecord={updateInstance}
        deleteRecord={removeInstance}
        schema={instanceSchema}
      />
    </div>
  );
}

export default InstanceDetailPage;
