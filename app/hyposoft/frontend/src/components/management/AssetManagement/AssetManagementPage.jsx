import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Button } from "antd";
import { assetColumns, assetFilters } from "./AssetSchema";
import DataList from "../shared/DataList";
import { fetchAssets } from "../../../redux/assets/actions";

function AssetManagementPage() {
  const assets = useSelector(s => Object.values(s.assets));
  const history = useHistory();
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(fetchAssets());
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Assets</Typography.Title>
      <Button
        shape="round"
        style={{ marginBottom: 8, marginRight: 8 }}
        href="admin/equipment/asset/import/"
      >
        Import
      </Button>
      <Button
        shape="round"
        style={{ marginBottom: 8, marginRight: 8 }}
        href="admin/equipment/asset/export/"
      >
        Export
      </Button>
      <DataList
        columns={assetColumns}
        filters={assetFilters}
        data={assets}
        onSelect={id => history.push(`/assets/${id}`)}
        onCreate={() => history.push("/assets/create")}
      />
    </div>
  );
}

export default AssetManagementPage;
