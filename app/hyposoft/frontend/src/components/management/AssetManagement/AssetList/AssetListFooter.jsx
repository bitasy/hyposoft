import React, { useContext } from "react";
import { AuthContext } from "../../../../contexts/contexts";
import { useHistory } from "react-router-dom";
import { PlusOutlined, PrinterOutlined } from "@ant-design/icons";
import CreateTooltip from "../../../utility/CreateTooltip";
import { Button } from "antd";

function AssetListFooter({ selectedAssets }) {
  const history = useHistory();
  const { user } = useContext(AuthContext);
  //TODO: fix permissions
  const createDisabled = !user?.is_staff;

  const printDisabled = selectedAssets.length == 0;

  function onCreate() {
    history.push("/assets/create");
  }

  function onPrint() {
    history.push(`/assets/print_view?asset_ids=${selectedAssets.join(",")}`);
  }

  return user ? (
    <div>
      <CreateTooltip
        isVisible={createDisabled}
        tooltipText={"Must have asset management privileges"}
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
