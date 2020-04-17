import React from "react";
import { Typography, Button, Table } from "antd";

function UserManagementPage() {
  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Users</Typography.Title>
      <Table
        rowSelection={rowSelection}
        rowKey={r => r.id}
        columns={assetColumns(forOffline ? "/offline_assets" : "/assets")}
        dataSource={data}
        onChange={onChange}
        pagination={false}
        footer={() =>
          modelID ? null : <AssetListFooter selectedAssets={selectedAssets} />
        }
      />
      <Table />
    </div>
  );
}

export default UserManagementPage;
