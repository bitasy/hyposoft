import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Button } from "antd";
import { instanceColumns, instanceFilters } from "./InstanceSchema";
import DataList from "../shared/DataList";
import { fetchInstances } from "../../../redux/actions";

function InstanceManagementPage() {
  const instances = useSelector(s => Object.values(s.instances));
  const history = useHistory();
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchInstances());
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Instances</Typography.Title>
      <Button
        shape="round"
        style={{ marginBottom: 8, marginRight: 8 }}
        href="admin/equipment/instance/import/"
      >
        Import
      </Button>
      <Button
        shape="round"
        style={{ marginBottom: 8, marginRight: 8 }}
        href="admin/equipment/instance/export/"
      >
        Export
      </Button>
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
