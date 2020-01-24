import React from "react";
import { useParams, useHistory } from "react-router-dom";
import DataDetailForm from "../shared/DataDetailForm";
import DataList from "../shared/DataList";
import API from "../../../api/API";
import { modelSchema } from "./ModelSchema";
import { Typography } from "antd";
import { instanceColumns } from "../InstanceManagement/InstanceSchema";

function ModelDetailPage() {
  const { id } = useParams();
  const history = useHistory();

  const [instances, setInstances] = React.useState([]);

  React.useEffect(() => {
    API.getInstances().then(instances => {
      setInstances(instances.filter(inst => inst.model.id === parseInt(id)));
    });
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Model Details</Typography.Title>
      <DataDetailForm
        id={id}
        getRecord={API.getModel}
        updateRecord={API.updateModel}
        deleteRecord={API.deleteModel}
        schema={modelSchema}
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
