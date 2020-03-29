import React from "react";
import style from "./Rack.module.css";

function byLevel(rackHeight, assets) {
  const rack = Array(rackHeight + 1).fill(null);
  assets.forEach(({ asset, model }) => {
    for (
      let i = asset.rack_position;
      i < asset.rack_position + model.height;
      i++
    ) {
      rack[i] = { asset, model };
    }
  });
  return rack;
}

function join(strs) {
  return strs.join(" ");
}

// rack:
/*
  {
    name: string,
    height: number,
    assets: { asset: Asset, model: Model }[]
  }
*/
function Rack({ rack, onSelect }) {
  const assetsByLevel = byLevel(rack.height, rack.assets);

  function renderCell(level) {
    if (!assetsByLevel[level]) {
      return (
        <tr
          key={level}
          onClick={() => onSelect(null, level)}
          className={join([style.noBorderBottom, style.noBorderTop])}
        >
          <td className={style.numberColumn}>{level}</td>
          <td className={style.infoColumnLeft} />
          <td className={style.infoColumnRight} />
        </tr>
      );
    }

    const { asset, model } = assetsByLevel[level];
    const isBottom = level === asset.rack_position;
    const isTop = level === asset.rack_position + model.height - 1;

    return (
      <tr
        style={{ backgroundColor: model.display_color }}
        className={join([
          isTop ? style.borderTop : style.noBorderTop,
          isBottom ? style.borderBottom : style.noBorderBottom,
        ])}
        onClick={() => onSelect(asset, level)}
        key={level}
      >
        <td className={style.numberColumn}>{level}</td>
        <td className={style.infoColumnLeft}>
          {isBottom && asset.isTmp ? "*" : ""}
          {isBottom ? model.vendor + "\t" + model.model_number : ""}
        </td>
        <td className={style.infoColumnRight}>
          {isBottom ? asset.hostname || "" : ""}
        </td>
      </tr>
    );
  }

  return (
    <table
      style={{ borderCollapse: "collapse", width: "100%" }}
      className={style.borders}
    >
      <thead>
        <tr className={style.borders}>
          <th className={style.numberColumn}>#</th>
          <th className={style.infoColumn} colSpan={2}>
            {rack.name}
          </th>
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
