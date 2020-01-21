import React from "react";
import Rack from "./Rack";

function InstancePositionPicker({ rack, model, value, onSelect }) {
  const temporaryInstance = value && {
    rack_u: value,
    model: model
  };

  const newRack = {
    ...rack,
    instances: temporaryInstance
      ? [temporaryInstance, ...rack.instances]
      : rack.instances
  };

  return <Rack rack={newRack} onSelect={onSelect} />;
}

// pretend that we're forwarding the reference, since the fieldDecorator is keep complaining
export default React.forwardRef((p, ref) => InstancePositionPicker(p));
