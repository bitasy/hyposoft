import React from "react";
import { useHistory } from "react-router-dom";
import API from "../../../api/API";
import { Typography } from "antd";
import { instanceColumns, instanceFilters } from "./InstanceSchema";
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
        columns={instanceColumns}
        filters={instanceFilters}
        data={instances}
        onSelect={id => history.push(`/instances/${id}`)}
        onCreate={() => history.push("/instances/create")}
      />
    </div>
  );
}

export default InstanceManagementPage;
