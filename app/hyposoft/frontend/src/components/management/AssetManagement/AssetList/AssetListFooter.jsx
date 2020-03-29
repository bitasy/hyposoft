import React, { useContext } from "react";
import { AuthContext } from "../../../../contexts/contexts";
import { useHistory } from "react-router-dom";
import { PlusOutlined, DisconnectOutlined } from "@ant-design/icons";
import CreateTooltip from "../../../utility/CreateTooltip";
import { Button } from "antd";

function AssetListFooter() {
  const history = useHistory();
  const { user } = useContext(AuthContext);
  console.log(user); //testing

  //TODO: fix this
  const createDisabled = !user?.is_staff;

  function onCreate() {
    history.push("/assets/create");
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
    </div>
  ) : null;
}

export default AssetListFooter;
