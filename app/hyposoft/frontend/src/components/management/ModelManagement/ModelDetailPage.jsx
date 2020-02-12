import React from "react";
import { useParams, useHistory } from "react-router-dom";
import DataDetailForm from "../shared/DataDetailForm";
import DataList from "../shared/DataList";
import { modelSchema } from "./ModelSchema";
import { Typography } from "antd";
import { instanceColumns } from "../InstanceManagement/InstanceSchema";
import { useSelector } from "react-redux";
import { fetchModel, updateModel, removeModel } from "../../../redux/actions";

function ModelDetailPage() {
  const { id } = useParams();
  const history = useHistory();
  const instances = useSelector(s =>
    Object.values(s.instances).filter(inst => inst.model.id === parseInt(id))
  );

  const isAdmin = useSelector(s => s.currentUser.is_superuser);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Model Details</Typography.Title>
      <DataDetailForm
        id={id}
        selector={(s, id) => s.models[id]}
        getRecord={fetchModel}
        updateRecord={updateModel}
        deleteRecord={removeModel}
        schema={modelSchema}
        disabled={!isAdmin}
      />

      <Typography.Title level={4}>Instances of this model</Typography.Title>
      <DataList
        columns={instanceColumns}
        filters={[]}
        data={instances}
        onSelect={id => history.push(`/instances/${id}`)}
        onCreate={() => {}}
        noCreate
      />
    </div>
  );
}

export default ModelDetailPage;
