import React from "react";
import Grid from "../RackManagement/Grid";
import { isEqual } from "lodash";
import { Typography, Button, Select } from "antd";
import { toIndex, indexToRow } from "./GridUtils";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchRacks,
  createRacks,
  removeRacks
} from "../../../redux/racks/actions";
import { GLOBAL_ABBR } from "../DatacenterManagment/DatacenterManagementPage";

const { Option } = Select;

function range(start, end) {
  return Array(end - start)
    .fill()
    .map((_, idx) => start + idx);
}

const RED = 1;
const GRAY = 2;
const DARKRED = 3;

export const GRID_COLOR_MAP = {
  0: "white",
  [RED]: "red",
  [GRAY]: "gray",
  [DARKRED]: "darkred"
};

export const MAX_ROW = 26;
export const MAX_COL = 99;

const ROWS = range(0, MAX_ROW).map(indexToRow);
const COLS = range(0, MAX_COL).map(v => (v + 1).toString());

function isInside([r1, r2, c1, c2], r, c) {
  return r1 <= r && r <= r2 && c1 <= c && c <= c2;
}

function showRacks(racks) {
  const idStr = racks.map(r => r.id).join(",");
  window.open("/#/racks/print_view?ids=" + idStr);
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
  const dcName = useSelector(s => s.appState.dcName, isEqual);
  const datacenters = useSelector(s => s.datacenters, isEqual);

  const [selectedDCName, setSelectedDCName] = React.useState(null);
  const selectedDCID = Object.values(datacenters).find(
    dc => dc.abbr === selectedDCName
  )?.id;
  const filteredRacks = racks.filter(r => r.datacenter === selectedDCID);

  const isAdmin = useSelector(s => s.currentUser.is_superuser);

  const [range, setRange] = React.useState(null);
  const clear = () => setRange(null);

  React.useEffect(() => {
    rehydrate();
    const listener = ({ keyCode }) => {
      if (keyCode === 27) {
        // esc
        setRange(null);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  React.useEffect(() => {
    const dcs = Object.values(datacenters);
    if ((!dcName || dcName === GLOBAL_ABBR) && dcs.length > 0) {
      setSelectedDCName(dcs[0].abbr);
    } else if (dcName !== GLOBAL_ABBR) {
      setSelectedDCName(dcName);
    } else {
      setSelectedDCName(null);
    }
  }, [dcName, datacenters]);

  function rehydrate() {
    dispatch(fetchRacks(selectedDCName));
  }

  function create([r1, r2, c1, c2]) {
    if (selectedDCID) {
      dispatch(
        createRacks(r1, r2, c1, c2, selectedDCID, clear, () => {
          rehydrate();
          clear();
        })
      );
    }
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

  const arrangedRange = range && [
    Math.min(range[0], range[1]),
    Math.max(range[0], range[1]),
    Math.min(range[2], range[3]),
    Math.max(range[2], range[3])
  ];

  const selectedRacks = arrangedRange
    ? filteredRacks.filter(rack =>
        isInside(arrangedRange, ...toIndex(rack.rack))
      )
    : [];

  function createColorMap() {
    const grid = {};
    if (arrangedRange) {
      const [r1, r2, c1, c2] = arrangedRange;
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          if (!grid[r]) grid[r] = {};
          grid[r][c] = RED;
        }
      }
    }
    filteredRacks.forEach(rack => {
      const [r, c] = toIndex(rack.rack);
      if (!grid[r]) grid[r] = {};
      grid[r][c] = grid[r][c] === RED ? DARKRED : GRAY;
    });
    return grid;
  }

  const colorMap = createColorMap();

  return (
    <div style={{ padding: 16 }}>
      <Typography.Title level={3}>Racks</Typography.Title>
      <span>Datacenter: </span>
      <Select
        value={selectedDCName}
        onChange={setSelectedDCName}
        style={{ width: 150 }}
      >
        {Object.values(datacenters).map(ds => (
          <Option key={ds.abbr} title={`${ds.name} (${ds.abbr})`}>
            {`${ds.name} (${ds.abbr})`}
          </Option>
        ))}
      </Select>
      {selectedDCName ? (
        <>
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
              disabled={!isAdmin || !range}
              type="primary"
              style={{ marginRight: 8 }}
              onClick={() => create(range)}
            >
              Create
            </Button>
            <Button
              disabled={!isAdmin || selectedRacks.length === 0}
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
        </>
      ) : null}
    </div>
  );
}

export default RackManagementPage;
