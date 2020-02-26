import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Button } from "antd";
import { assetColumns, assetFilters } from "./AssetSchema";
import DataList from "../shared/DataList";
import { fetchAssets } from "../../../redux/assets/actions";
import { fetchNetworkConnectedPDUs } from "../../../redux/racks/actions";

function AssetManagementPage() {
  const assets = useSelector(s => Object.values(s.assets));
  const datacenters = useSelector(s => Object.values(s.datacenters));
  const dcName = useSelector(s => s.appState.dcName);
  const history = useHistory();
  const dispatch = useDispatch();

  const isAdmin = useSelector(s => s.currentUser.is_staff);

  const currentDCID = datacenters.find(dc => dc.abbr === dcName)?.id;
  const filteredAssets = currentDCID
    ? assets.filter(a => a.rack.datacenter === currentDCID)
    : assets;

  React.useEffect(() => {
    dispatch(fetchAssets(dcName));
    dispatch(fetchNetworkConnectedPDUs());
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Assets</Typography.Title>

      <div style={{ marginBottom: 8 }}>
        <span style={{ color: "orange" }}>
          Note: Filters do not transfer to export!
        </span>
      </div>

      <div>
        <Button
          shape="round"
          style={{ marginBottom: 8, marginRight: 8 }}
          href="admin/equipment/asset/import/"
        >
          Import Assets
        </Button>
        <Button
          shape="round"
          style={{ marginBottom: 8, marginRight: 8 }}
          href="admin/equipment/asset/export/"
        >
          Export Assets
        </Button>
      </div>

      <div style={{ marginBottom: 8 }}>
        <Button
          shape="round"
          style={{ marginBottom: 8, marginRight: 8 }}
          href="admin/equipment/networkport/import/"
        >
          Import Networks
        </Button>
        <Button
          shape="round"
          style={{ marginBottom: 8, marginRight: 8 }}
          href="admin/equipment/networkport/export/"
        >
          Export Networks
        </Button>
      </div>

      <DataList
        columns={assetColumns}
        filters={assetFilters}
        data={filteredAssets}
        onSelect={id => history.push(`/assets/${id}`)}
        onCreate={() => history.push("/assets/create")}
        createDisabled={!isAdmin}
      />
    </div>
  );
}

export default AssetManagementPage;
