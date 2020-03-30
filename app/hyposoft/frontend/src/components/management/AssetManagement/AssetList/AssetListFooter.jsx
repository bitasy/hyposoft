import React, { useContext } from "react";
import { AuthContext } from "../../../../contexts/contexts";
import { useHistory } from "react-router-dom";
import { PlusOutlined, PrinterOutlined } from "@ant-design/icons";
import CreateTooltip from "../../../utility/CreateTooltip";
import { Button } from "antd";

function AssetListFooter( {selectedAssets} ) {
  const history = useHistory();
  const { user } = useContext(AuthContext);

  console.log("user", user);

  //TODO: fix permissions
  const createDisabled = !user?.is_staff;

  //TODO: if selected asset list is null
  const printDisabled = false;

  //TODO: create function to get asset numbers only
  let assetNumbersAsString = "";

  function getAssetNumbersAsString() {
      // selectedAssets.map(function(asset, index)){
      //     s = "/asset?
      // }
      // assetNumbersAsString = a.join(",");
      // return (assetNumbersAsString);

  }

  function onCreate() {
    history.push("/assets/create");
  }

  //TODO: pass through which assets should have labels printed
  function onPrint() {
    //history.push("/assets/print_view?asset_numbers=" + getAssetNumbersAsString()) //pass this asset numbers
      // history.push("/assets/print_view?asset_number=100000");
      history.push("/assets/print_view");
  }

  return user ? (
    <div>
      <CreateTooltip
        isVisible={createDisabled}
        tooltipText={"Only users with admin privileges can create a new item"}
      >
        <Button onClick={onCreate} disabled={createDisabled}>
          <PlusOutlined />
        </Button>
      </CreateTooltip>
      <Button onClick={onPrint} disabled={printDisabled}>
        <PrinterOutlined />
      </Button>
    </div>
  ) : null;
}

export default AssetListFooter;
