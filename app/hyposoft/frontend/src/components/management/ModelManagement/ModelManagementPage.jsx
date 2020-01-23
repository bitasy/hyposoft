import React from "react";
import { useHistory } from "react-router-dom";
import API from "../../../api/API";
import { Typography } from "antd";
import { modelColumns, modelFilters } from "./ModelSchema";
import DataList from "../shared/DataList";

function ModelManagementPage() {
  const [models, setModels] = React.useState([]);
  const history = useHistory();

  React.useEffect(() => {
    API.getModels().then(setModels);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Registered Models</Typography.Title>
      <DataList
        columns={modelColumns}
        filters={modelFilters}
        data={models}
        onSelect={id => history.push(`/models/${id}`)}
        onCreate={() => history.push("/models/create")}
      />
    </div>
  );
}

export default ModelManagementPage;
