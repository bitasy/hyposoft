import React, { useContext } from "react";
import { AuthContext } from "../../../../contexts/contexts";
import { useHistory } from "react-router-dom";
import { PlusOutlined, PrinterOutlined } from "@ant-design/icons";
import CreateTooltip from "../../../utility/CreateTooltip";
import { Button } from "antd";

function AssetListFooter() {
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const createDisabled = !user?.is_staff;

  //TODO: if selected asset list is null
  const printDisabled = false;

  function onCreate() {
    history.push("/assets/create");
  }

  function onPrint() {
    history.push("/assets/print_view")
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
