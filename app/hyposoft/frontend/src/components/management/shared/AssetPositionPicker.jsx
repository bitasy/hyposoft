import React from "react";
import Rack from "./Rack";

function toInterval(level, height) {
  return [level, level + height];
}

function isOverlapping(interval1, interval2) {
  const [l1, r1] = interval1;
  const [l2, r2] = interval2;
  return !(r1 <= l2 || r2 <= l1);
}

function validateLevel(model, level, rack) {
  const interval1 = toInterval(level, model.height);
  return (
    rack.assets != null &&
    rack.assets.every(inst => {
      const interval2 = toInterval(inst.rack_position, inst.model.height);
      return !isOverlapping(interval1, interval2);
    }) &&
    level + model.height - 1 <= rack.height
  );
}

function AssetPositionPicker({
  rack,
  model,
  value,
  hostname,
  onSelect,
  onValidation,
  disabled
}) {
  const temporaryAsset = value && {
    rack_position: value,
    hostname: hostname,
    model: model,
    isTmp: true
  };

  React.useEffect(() => {
    value && onValidation(validateLevel(model, value, rack));
  }, [rack, model, value]);

  const newRack = {
    ...rack,
    assets: temporaryAsset ? [temporaryAsset, ...rack.assets] : rack.assets
  };

  function validateAndSelect(asset, level) {
    !disabled && validateLevel(model, level, rack) && onSelect(asset, level);
  }

  return <Rack rack={newRack} onSelect={validateAndSelect} />;
}

// pretend that we're forwarding the reference, since the fieldDecorator is keep complaining
export default React.forwardRef((p, ref) => AssetPositionPicker(p));
