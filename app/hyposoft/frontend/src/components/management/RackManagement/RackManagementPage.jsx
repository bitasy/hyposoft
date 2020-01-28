import React from "react";
import Grid from "../RackManagement/Grid";
import API from "../../../api/API";
import { Typography, Button } from "antd";
import GridRangeSelector from "./GridRangeSelector";
import { toIndex, indexToRow, indexToCol } from "./GridUtils";

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
    const r = rack.row;
    const c = rack.number.toString();
    if (!grouped[r]) grouped[r] = {};
    grouped[r][c] = rack;
  });
  return grouped;
}

function RackManagementPage() {
  const [racks, setRacks] = React.useState([]);
  const [rackGroup, setRackGroup] = React.useState({});
  const [range, setRange] = React.useState(null);

  const [racksOnModal, setRacksOnModal] = React.useState([]);

  React.useEffect(() => {
    rehydrate();
  }, []);

  function rehydrate() {
    API.getRacks().then(racks => {
      setRacks(racks);
      setRackGroup(groupByRowColumn(racks));
    });
  }

  function create([r1, r2, c1, c2]) {
    API.createRacks(
      indexToRow(r1),
      indexToRow(r2),
      indexToCol(c1),
      indexToCol(c2)
    ).then(() => rehydrate());
  }

  function remove(racks) {
    if (confirm(`Removing ${racks.length} rack(s). Are you sure about this?`)) {
      API.deleteRacks(racks.map(rack => rack.id)).then(() => rehydrate());
    }
  }

  function showRacks(racks) {
    const idStr = racks.map(r => r.id).join(",");
    window.open("/#/racks/print_view?ids=" + idStr);
  }

  const selectedRacks = range
    ? racks.filter(rack =>
        isInside(range, ...toIndex([rack.row, rack.number.toString()]))
      )
    : [];

  function renderCell(r, c) {
    const rStr = ROWS[r];
    const cStr = COLS[c];

    const existing = rackGroup[rStr] && rackGroup[rStr][cStr];
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
      <Grid rows={ROWS} columns={COLS} renderCell={renderCell} />
      <Typography.Title level={4} style={{ marginTop: 16 }}>
        Select range
      </Typography.Title>
      <GridRangeSelector onChange={setRange} />
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
