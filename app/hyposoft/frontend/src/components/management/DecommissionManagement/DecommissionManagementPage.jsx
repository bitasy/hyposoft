import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Button } from "antd";
import { assetColumns, assetFilters } from "../AssetManagement/AssetSchema";
import DataList from "../shared/DataList";
import RealAPI from "../../../api/API";

function DecommissionManagementPage() {
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

    const decomColumns = assetColumns + [];
    const decomFilters = assetFilters + [];

    return (
        <div style={{ padding: 16 }}>
            <Typography.Title level={3}>Decommissioned Assets</Typography.Title>

            <DataList
                columns={assetColumns}
                filters={assetFilters}
                fetchData={RealAPI.getPaginatedAssets}
                onSelect={id => history.push(`/assets/${id}`)}
                onCreate={() => history.push("/assets/create")}
                createDisabled={!isAdmin}
            />

        </div>
    );
}

export default DecommissionManagementPage;
