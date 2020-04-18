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

    //configure signals for editable views
    const canModelCRUD = !!(hasModelPerm || hasAdminPerm);
    const canAssetCRUD = !!(hasAssetPerm || hasAdminPerm);
    const canDecommission = !!(hasAssetPerm || hasAdminPerm);
    const canOfflineCRUD = !!(hasAssetPerm || hasAdminPerm);
    const canRackCRUD = !!(hasAssetPerm || hasAdminPerm);
    const canChangePlan = !!(hasAssetPerm || hasAdminPerm);

    //configure signals for within detail views
    const canAssetPower = !!(hasPowerPerm || hasAdminPerm);

    const config = {
        canLogView,
        canModelCRUD,
        canAssetCRUD,
        canDecommission,
        canOfflineCRUD,
        canRackCRUD,
        canChangePlan,
        canAssetPower,
    }

    return config;
}

export default ConfigurePermissions;