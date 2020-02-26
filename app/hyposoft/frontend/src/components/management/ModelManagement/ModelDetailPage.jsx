import React from "react";
import { useParams, useHistory } from "react-router-dom";
import DataDetailForm from "../shared/DataDetailForm";
import DataList from "../shared/DataList";
import { modelSchema } from "./ModelSchema";
import { Typography } from "antd";
import { assetColumns } from "../AssetManagement/AssetSchema";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchModel,
  updateModel,
  removeModel
} from "../../../redux/models/actions";
import RealAPI from "../../../api/API";

function ModelDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();
  const models = useSelector(s => s.models);
  const dcName = useSelector(s => s.appState.dcName);
  const assets = useSelector(s =>
    Object.values(s.assets).filter(inst => inst.model.id == id)
  );
  const isAdmin = useSelector(s => s.currentUser.is_staff);

  React.useEffect(() => {
    dispatch(fetchModel(id));
  }, [id]);

  const record = models[id];

  if (!record) return null;

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Model Details</Typography.Title>
      <DataDetailForm
        record={record}
        updateRecord={updateModel}
        deleteRecord={removeModel}
        schema={modelSchema}
        disabled={!isAdmin}
      />

      <Typography.Title level={4}>Assets of this model</Typography.Title>
      <DataList
        columns={assetColumns}
        filters={[]}
        fetchData={(limit, offset) =>
          RealAPI.getPaginatedAssets(dcName, limit, offset, { itmodel__id: id })
        }
        data={assets}
        onSelect={id => history.push(`/assets/${id}`)}
        onCreate={() => {}}
        noCreate
      />
    </div>
  );
}

export default ModelDetailPage;
