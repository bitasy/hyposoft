import React from "react";
import style from "./Rack.module.css";
import { DEFAULT_COLOR_VALUE } from "../ModelManagement/ModelSchema";

function byLevel(rackHeight, instances) {
  const rack = Array(rackHeight + 1).fill(null);
  instances.forEach(instance => {
    for (
      let i = instance.rack_u;
      i < instance.rack_u + instance.model.height;
      i++
    ) {
      rack[i] = instance;
    }
  });
  return rack;
}

function join(strs) {
  return strs.join(" ");
}

function Rack({ rack, onSelect }) {
  const instancesByLevel = byLevel(rack.height, rack.instances);

  function renderCell(level) {
    const instance = instancesByLevel[level];

    if (!instance) {
      return (
        <tr
          key={level}
          onClick={() => onSelect(null, level)}
          className={join([style.noBorderBottom, style.noBorderTop])}
        >
          <td className={style.numberColumn}>{level}</td>
          <td className={style.infoColumn} />
        </tr>
      );
    }

    const model = instance.model;
    const isBottom = level === instance.rack_u;
    const isTop = level === instance.rack_u + model.height - 1;

    return (
      <tr
        style={{ backgroundColor: model.display_color || DEFAULT_COLOR_VALUE }}
        className={join([
          isTop ? style.borderTop : style.noBorderTop,
          isBottom ? style.borderBottom : style.noBorderBottom
        ])}
        onClick={() => onSelect(instance, level)}
        key={level}
      >
        <td className={style.numberColumn}>{level}</td>
        <td className={style.infoColumn}>
          {isBottom
            ? model.vendor +
              "\t" +
              model.model_number +
              "\t" +
              (model.hostname || "")
            : ""}
        </td>
      </tr>
    );
  }

  return (
    <table style={{ borderCollapse: "collapse" }} className={style.borders}>
      <thead>
        <tr className={style.borders}>
          <th className={style.numberColumn}>#</th>
          <th className={style.infoColumn}>{rack.name}</th>
        </tr>
      </thead>
      <tbody>
        {Array(rack.height)
          .fill(0)
          .map((_, idx) => renderCell(rack.height - idx))}
      </tbody>
    </table>
  );
}

export default Rack;
