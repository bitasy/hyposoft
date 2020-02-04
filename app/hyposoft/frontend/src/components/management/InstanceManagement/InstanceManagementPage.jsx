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
      <a
        href="https://d1b10bmlvqabco.cloudfront.net/attach/k4u27qnccr45oo/is4xdnkb8px4ee/k5zjop579k59/ECE458__Bulk_Format_Proposal3.pdf"
        target="_blank"
      >
        Import/Export Specs
      </a>
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
