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

  function validateAndSelect(instance, level) {
    if (rack.instances) {
      const interval1 = toInterval(level, model.height);
      if (
        rack.instances.every(inst => {
          const interval2 = toInterval(inst.rack_u, inst.model.height);
          return !isOverlapping(interval1, interval2);
        })
      ) {
        onSelect(instance, level);
      }
    }
  }

  return <Rack rack={newRack} onSelect={validateAndSelect} />;
}

// pretend that we're forwarding the reference, since the fieldDecorator is keep complaining
export default React.forwardRef((p, ref) => InstancePositionPicker(p));
