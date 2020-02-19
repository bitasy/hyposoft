import React from "react";
import { displayError, displayInfo } from "../../../global/message";
import { Button, message } from "antd";
import API from "../../../api/API";

function networkActions(asset, user) {
  if (asset.owner.username === user.username || user.is_superuser) {
    const pdus = asset.rack.pdu_set;
    const pdu = pdus.find(pdu =>
      // pdu.network_connected &&
      pdu.assets.includes(asset.id)
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

function decorate(op) {
  return () => {
    const hide = message.loading("Operation in progress...");
    op()
      .then(() => {
        hide();
        displayInfo("Success!");
      })
      .catch(e => {
        hide();
        displayError(e);
      });
  };
}

function preventing(op) {
  return e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    op(e);
  };
}

function NetworkPowerActionButtons({ asset, user }) {
  const actions = networkActions(asset, user);

  if (actions) {
    const [on, off, cycle] = actions;

    return (
      <Button.Group>
        <Button onClick={preventing(decorate(on))}>On</Button>
        <Button onClick={preventing(decorate(off))}>Off</Button>
        <Button onClick={preventing(decorate(cycle))}>Cycle</Button>
      </Button.Group>
    );
  } else {
    return null;
  }
}

export default NetworkPowerActionButtons;
