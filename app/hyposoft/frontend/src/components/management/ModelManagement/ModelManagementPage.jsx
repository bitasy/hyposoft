import React from "react";
import { useHistory } from "react-router-dom";
import { Typography } from "antd";
import { modelColumns, modelFilters } from "./ModelSchema";
import DataList from "../shared/DataList";
import { useSelector, useDispatch } from "react-redux";
import { fetchModels } from "../../../redux/actions";

function ModelManagementPage() {
  const models = useSelector(s => Object.values(s.models));
  const history = useHistory();
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchModels());
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Models</Typography.Title>
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
