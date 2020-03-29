import React from "react";
import CreateDataForm from "../shared/CreateDataForm";
import { assetSchema } from "./AssetSchema";
import { Typography } from "antd";
import { createAsset } from "../../../redux/assets/actions";

function CreateAssetPage() {
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Create Asset</Typography.Title>
      <CreateDataForm createRecord={createAsset} schema={assetSchema} />
    </div>
  );
}

export default CreateAssetPage;
