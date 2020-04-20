import React, { useContext } from "react";
import {AuthContext} from "../../contexts/contexts";

function ConfigurePermissions() {

    const { user } = useContext(AuthContext); //returns user object from auth/current_user
    console.log(user);
    const hasModelPerm = !!user?.permission?.model_perm; //if true -> true, if null/false -> false
    const hasAssetPerm = !!user?.permission?.asset_perm;
    const hasPowerPerm = !!user?.permission?.power_perm;
    const hasAuditPerm = !!user?.permission?.audit_perm;
    const hasAdminPerm = !!user?.permission?.admin_perm;


    //TODO: add owner permissions
    //TODO: add site permissions

    //configure signals for viewable tabs
    const canLogView = !!(hasAuditPerm || hasAdminPerm);
    const canChangePlan = !!(hasAssetPerm || hasAdminPerm);

    //configure signals for editable views
    const canModelCUD = !!(hasModelPerm || hasAdminPerm);
    const canAssetCUDD = !!(hasAssetPerm || hasAdminPerm);
    //const canDecommission = !!(hasAssetPerm || hasAdminPerm);
    const canOfflineCUDD = !!(hasAssetPerm || hasAdminPerm);
    const canSiteCUD = !!(hasAssetPerm || hasAdminPerm);
    const canRackCUD = !!(hasAssetPerm || hasAdminPerm);

    //configure signals for within detail views
    const canAssetPower = !!(hasPowerPerm || hasAdminPerm);

    const config = {
        canLogView,
        canChangePlan,
        canModelCUD,
        canAssetCUDD,
        canOfflineCUDD,
        canSiteCUD,
        canRackCUD,
        canAssetPower,
    }

    return config;
}

export default ConfigurePermissions;