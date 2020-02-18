import React from "react";
import Grid from "../RackManagement/Grid";
import { Typography, Button } from "antd";
import { toIndex, indexToRow, indexToCol } from "./GridUtils";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchRacks,
  createRacks,
  removeRacks
} from "../../../redux/racks/actions";

function range(start, end) {
  return Array(end - start)
    .fill()
    .map((_, idx) => start + idx);
}

export const MAX_ROW = 26;
export const MAX_COL = 99;

const ROWS = range(0, MAX_ROW).map(indexToRow);
const COLS = range(0, MAX_COL).map(v => (v + 1).toString());

function makeEmptyGrid(initialValue) {
  return Array(MAX_ROW)
    .fill()
    .map(() => Array(MAX_COL).fill(initialValue));
}

function isInside([r1, r2, c1, c2], r, c) {
  return r1 <= r && r <= r2 && c1 <= c && c <= c2;
}

function groupByRowColumn(racks) {
  const grouped = {};
  racks.forEach(rack => {
    const [r, c] = toIndex(rack.rack);
    if (!grouped[r]) grouped[r] = {};
    grouped[r][c] = rack;
  });
  return grouped;
}

function LegendItem({ color, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          width: 20,
          height: 20,
          backgroundColor: color,
          display: "inline-block"
        }}
      />
      <span style={{ marginLeft: 5 }}>{text}</span>
    </div>
  );
}

function Legend() {
  return (
    <div style={{ margin: 5 }}>
      <LegendItem color="darkred" text="Selected racks" />
      <LegendItem color="gray" text="Racks" />
      <LegendItem color="red" text="Selection" />
    </div>
  );
}

function RackManagementPage() {
  const dispatch = useDispatch();
  const racks = useSelector(s => Object.values(s.racks));
  const rackGroup = useSelector(s => groupByRowColumn(Object.values(s.racks)));

  const [range, setRange] = React.useState(null);
  const clear = () => setRange(null);

  React.useEffect(() => {
    rehydrate();
    window.addEventListener("keydown", ({ keyCode }) => {
      if (keyCode === 27) {
        // esc
        setRange(null);
      }
    });
    return () => window.removeEventListener("keydown");
  }, []);

  function rehydrate() {
    dispatch(fetchRacks());
  }

  function create([r1, r2, c1, c2]) {
    dispatch(
      createRacks(r1, r2, c1, c2, clear, () => {
        rehydrate();
        clear();
      })
    );
  }

  function remove(racks) {
    if (confirm(`Removing ${racks.length} rack(s). Are you sure about this?`)) {
      dispatch(
        removeRacks(
          racks.map(rack => rack.id),
          clear,
          () => {
            rehydrate();
            clear();
          }
        )
      );
    }
  }

  function showRacks(racks) {
    const idStr = racks.map(r => r.id).join(",");
    window.open("/#/racks/print_view?ids=" + idStr);
  }

  const arrangedRange = range && [
    Math.min(range[0], range[1]),
    Math.max(range[0], range[1]),
    Math.min(range[2], range[3]),
    Math.max(range[2], range[3])
  ];

  const selectedRacks = arrangedRange
    ? racks.filter(rack => isInside(arrangedRange, ...toIndex(rack.rack)))
    : [];

  function getColor(r, c) {
    const existing = rackGroup[r] && rackGroup[r][c];
    const inRange = arrangedRange && isInside(arrangedRange, r, c);

    return existing && inRange
      ? "darkred"
      : existing
      ? "gray"
      : inRange
      ? "red"
      : "white";
  }

  function createColorMap() {
    const grid = makeEmptyGrid("white");
    if (arrangedRange) {
      const [r1, r2, c1, c2] = arrangedRange;
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          grid[r][c] = getColor(r, c);
        }
      }
    }
    return grid;
  }

  const colorMap = createColorMap();

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Racks</Typography.Title>
      <Legend />
      <Grid
        rows={ROWS}
        columns={COLS}
        colorMap={colorMap}
        setRange={setRange}
        range={range}
      />
      <div style={{ marginTop: 16 }}>
        <Button
          disabled={!range}
          type="primary"
          style={{ marginRight: 8 }}
          onClick={() => create(range)}
        >
          Create
        </Button>
        <Button
          disabled={selectedRacks.length == 0}
          type="danger"
          style={{ marginRight: 8 }}
          onClick={() => remove(selectedRacks)}
        >
          Remove
        </Button>
        <Button
          disabled={selectedRacks.length == 0}
          type="default"
          onClick={() => showRacks(selectedRacks)}
        >
          View
        </Button>
      </div>
    </div>
  );
}

export default RackManagementPage;
