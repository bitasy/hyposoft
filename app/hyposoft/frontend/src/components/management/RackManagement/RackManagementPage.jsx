import React from "react";
import Grid from "../RackManagement/Grid";
import { Typography, Button } from "antd";
import GridRangeSelector from "./GridRangeSelector";
import { toIndex, indexToRow, indexToCol } from "./GridUtils";
import { useSelector, useDispatch } from "react-redux";
import { fetchRacks, createRacks, removeRacks } from "../../../redux/actions";

function range(start, end) {
  return Array(end - start)
    .fill()
    .map((_, idx) => start + idx);
}

export const MAX_ROW = 26;
export const MAX_COL = 39;

const ROWS = range(0, MAX_ROW).map(indexToRow);
const COLS = range(0, MAX_COL).map(v => (v + 1).toString());

function isInside([r1, r2, c1, c2], r, c) {
  return r1 <= r && r <= r2 && c1 <= c && c <= c2;
}

const full = { width: "100%", height: "100%" };

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
  const [clearTrigger, setClearTrigger] = React.useState(0);
  function clear() {
    setClearTrigger(1 - clearTrigger);
  }

  React.useEffect(() => {
    rehydrate();
  }, []);

  function rehydrate() {
    dispatch(fetchRacks());
  }

  function create([r1, r2, c1, c2]) {
    dispatch(
      createRacks(
        indexToRow(r1),
        indexToRow(r2),
        indexToCol(c1),
        indexToCol(c2),
        clear,
        () => {
          rehydrate();
          clear();
        }
      )
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

  const selectedRacks = range
    ? racks.filter(rack => isInside(range, ...toIndex(rack.rack)))
    : [];

  function renderCell(r, c) {
    const existing = rackGroup[r] && rackGroup[r][c];
    const inRange = range && isInside(range, r, c);

    let color =
      existing && inRange
        ? "darkred"
        : existing
        ? "gray"
        : inRange
        ? "red"
        : "white";

    return <div style={{ backgroundColor: color, ...full }} />;
  }

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Racks</Typography.Title>
      <Legend />
      <Grid rows={ROWS} columns={COLS} renderCell={renderCell} />
      <Typography.Title level={4} style={{ marginTop: 16 }}>
        Select range
      </Typography.Title>
      <GridRangeSelector onChange={setRange} clearTrigger={clearTrigger} />
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
