import React from "react";
import { useHistory } from "react-router-dom";
import { Typography, Button, Icon } from "antd";
import { modelColumns, modelFilters } from "./ModelSchema";
import DataList from "../shared/DataList";
import { useSelector, useDispatch } from "react-redux";
import { fetchModels } from "../../../redux/models/actions";

function ModelManagementPage() {
  const models = useSelector(s => Object.values(s.models));
  const history = useHistory();
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchModels());
  }, []);

  const isAdmin = useSelector(s => s.currentUser.is_staff);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Models</Typography.Title>
      <Button
        shape="round"
        style={{ marginBottom: 8, marginRight: 8 }}
        href="admin/equipment/itmodel/import/"
      >
        Import
      </Button>
      <Button
        shape="round"
        style={{ marginBottom: 8, marginRight: 8 }}
        href="admin/equipment/itmodel/export/"
      >
        Export
      </Button>
      <DataList
        columns={modelColumns}
        filters={modelFilters}
        data={models}
        onSelect={id => history.push(`/models/${id}`)}
        onCreate={() => history.push("/models/create")}
        createDisabled={!isAdmin}
      />
    </div>
  );
}

export default ModelManagementPage;
