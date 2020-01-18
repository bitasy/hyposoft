import React from "react";
import { useHistory } from "react-router-dom";
import API from "../../../api/API";
import { Typography } from "antd";
import instanceSchema from "./InstanceSchema";
import DataList from "../shared/DataList";

function InstanceManagementPage() {
  const [instances, setInstances] = React.useState([]);
  const history = useHistory();

  React.useEffect(() => {
    API.getInstances().then(setInstances);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Registered Instances</Typography.Title>
      <DataList
        schema={instanceSchema}
        data={instances}
        onSelect={id => history.push(`/instances/${id}`)}
      />
    </div>
  );
}

export default InstanceManagementPage;
