import React from "react";
import { useParams, useHistory } from "react-router-dom";
import DataDetailForm from "../shared/DataDetailForm";
import DataList from "../shared/DataList";
import { modelSchema } from "./ModelSchema";
import { Typography } from "antd";
import { assetColumns } from "../AssetManagement/AssetSchema";
import { useSelector } from "react-redux";
import { fetchModel, updateModel, removeModel } from "../../../redux/actions";

function ModelDetailPage() {
  const { id } = useParams();
  const history = useHistory();
  const assets = useSelector(s =>
    Object.values(s.assets).filter(inst => inst.model.id === parseInt(id))
  );

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
      />

      <Typography.Title level={4}>Assets of this model</Typography.Title>
      <DataList
        columns={assetColumns}
        filters={[]}
        data={assets}
        onSelect={id => history.push(`/assets/${id}`)}
        onCreate={() => {}}
        noCreate
      />
    </div>
  );
}

export default ModelDetailPage;
