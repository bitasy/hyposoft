import React from "react";
import { displayError, displayInfo } from "../../../global/message";
import { Button, message } from "antd";
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

function preventing(op) {
  return e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    op(e);
  };
}

function NetworkPowerActionButtons({ asset, user }) {
  const networkConnectedPDUs = useSelector(s => s.networkConnectedPDUs);
  const actions = networkActions(asset, user, networkConnectedPDUs);

  if (actions) {
    const [on, off, cycle] = actions;

    return (
      <Button.Group>
        <Button onClick={preventing(on)}>On</Button>
        <Button onClick={preventing(off)}>Off</Button>
        <Button onClick={preventing(cycle)}>Cycle</Button>
      </Button.Group>
    );
  } else {
    return null;
  }
}

export default NetworkPowerActionButtons;
