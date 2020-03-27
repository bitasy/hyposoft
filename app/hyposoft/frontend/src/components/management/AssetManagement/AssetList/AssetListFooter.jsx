import React, { useContext } from "react";
import { AuthContext } from "../../../../contexts/contexts";
import { useHistory } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import CreateTooltip from "../../../utility/CreateTooltip";
import { Button } from "antd";

function AssetListFooter() {
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const createDisabled = !user?.is_staff;

  function onCreate() {
    history.push("/assets/create");
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
    </div>
  ) : null;
}

export default AssetListFooter;
