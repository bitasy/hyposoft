import React from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Button } from "antd";
import DataList from "../shared/DataList";
import RealAPI from "../../../api/API";

function DecommissionManagementPage() {
    // const assets = useSelector(s => Object.values(s.assets));
    // const datacenters = useSelector(s => Object.values(s.datacenters));
    // const dcName = useSelector(s => s.appState.dcName);
    // const history = useHistory();
    // const dispatch = useDispatch();
    //
    // const isAdmin = useSelector(s => s.currentUser.is_staff);
    //
    // const currentDCID = datacenters.find(dc => dc.abbr === dcName)?.id;
    // const filteredAssets = currentDCID
    //     ? assets.filter(a => a.rack.datacenter === currentDCID)
    //     : assets;


    return (
        <div style={{ padding: 16 }}>
            <Typography.Title level={3}>Decommissioned Assets</Typography.Title>

        </div>
    );
}

export default DecommissionManagementPage;
