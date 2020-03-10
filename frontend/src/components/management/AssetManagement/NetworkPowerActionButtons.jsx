import React from "react";
import { Button } from "antd";
import API from "../../../api/API";
import { useSelector } from "react-redux";

function networkActions(asset, user, networkConnectedPDUs) {
  if (asset.owner.username === user.username || user.is_staff) {
    const pdus = asset.rack.pdu_set;
    const pdu = pdus.find(
      pdu =>
        networkConnectedPDUs.includes(pdu.id) && pdu.assets.includes(asset.id)
    );

    if (pdu) {
      return [
        () => API.turnOn(asset.id),
        () => API.turnOff(asset.id),
        () => API.cycle(asset.id)
      ];
    }
  }
  return null;
}

function preventing(op, onSuccess) {
  return e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    op(e).then(onSuccess);
  };
}

const ON = "On";
const OFF = "Off";

function NetworkPowerActionButtons({ asset, user, displayState }) {
  const networkConnectedPDUs = useSelector(s => s.networkConnectedPDUs);
  const actions = networkActions(asset, user, networkConnectedPDUs);

  const [trigger, setTrigger] = React.useState(0);
  const refetch = () => setTrigger(1 - trigger);
  const refetchLater = () => setTimeout(refetch, 2000);
  const [powerState, setPowerState] = React.useState("");

  React.useEffect(() => {
    if (displayState) {
      API.getPowerState(asset.id).then(setPowerState);
    }
  }, [trigger]);

  if (actions) {
    const [on, off, cycle] = actions;

    return (
      <>
        <Button.Group>
          <Button
            onClick={preventing(on, refetch)}
            type={powerState === ON && displayState ? "primary" : "default"}
          >
            On
          </Button>
          <Button
            onClick={preventing(off, refetch)}
            type={powerState === OFF && displayState ? "dashed" : "default"}
          >
            Off
          </Button>
          <Button onClick={preventing(cycle, refetchLater)}>Cycle</Button>
        </Button.Group>
        {displayState && ![ON, OFF].includes(powerState) ? (
          <span style={{ color: "gray" }}>Power state unknown!</span>
        ) : null}
      </>
    );
  } else {
    return null;
  }
}

export default NetworkPowerActionButtons;
