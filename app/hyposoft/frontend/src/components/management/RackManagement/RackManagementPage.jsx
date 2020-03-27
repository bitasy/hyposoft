import React, { useContext, useState } from "react";
import Grid from "../RackManagement/Grid";
import { Typography, Button, Select, message, Alert } from "antd";
import { toIndex, indexToRow } from "./GridUtils";
import CreateTooltip from "../../utility/CreateTooltip";
import { getRackList, createRack, deleteRacks } from "../../../api/rack";
import { DCContext, AuthContext } from "../../../contexts/Contexts";
import { getDatacenters } from "../../../api/datacenter";
import VSpace from "../../utility/VSpace";

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
  [DARKRED]: "darkred",
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
          display: "inline-block",
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
  const { datacenter } = useContext(DCContext);

  const { user } = useContext(AuthContext);
  const isAdmin = user?.is_staff;

  const [racks, setRacks] = useState([]);
  const [datacenters, setDatacenters] = useState([]);
  const [selectedDC, setSelectedDC] = useState(null);

  const [warnings, setWarnings] = useState([]);
  const [errors, setErrors] = useState([]);

  const finalSelectedDC = datacenter ?? selectedDC;

  let textCreate = isAdmin
    ? "Select range to create racks"
    : "Only users with admin privileges can create racks";
  let textDelete = isAdmin
    ? "Select range to delete racks"
    : "Only users with admin privileges can delete racks";

  const [range, setRange] = React.useState(null);
  const clear = () => setRange(null);

  React.useEffect(() => {
    getDatacenters().then(setDatacenters);
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
    rehydrate();
  }, [finalSelectedDC]);

  function rehydrate() {
    const abbr = finalSelectedDC?.abbr;
    if (abbr) {
      getRackList(abbr).then(setRacks);
    } else {
      setRacks([]);
    }
  }

  function create([r1, r2, c1, c2]) {
    const dcID = finalSelectedDC?.id;
    if (dcID) {
      createRack(dcID, r1, r2, c1, c2)
        .then(({ warn, err }) => {
          setWarnings(warn);
          setErrors(err);
        })
        .then(clear)
        .then(rehydrate);
    }
  }

  function remove([r1, r2, c1, c2]) {
    const dcID = finalSelectedDC?.id;
    if (dcID && confirm(`Are you sure about this?`)) {
      deleteRacks(dcID, r1, r2, c1, c2)
        .then(({ warn, err }) => {
          setWarnings(warn);
          setErrors(err);
        })
        .then(clear)
        .then(rehydrate);
    }
  }

  const arrangedRange = range && [
    Math.min(range[0], range[1]),
    Math.max(range[0], range[1]),
    Math.min(range[2], range[3]),
    Math.max(range[2], range[3]),
  ];

  const selectedRacks = arrangedRange
    ? racks.filter(rack => isInside(arrangedRange, ...toIndex(rack.rack)))
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
    racks.forEach(rack => {
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
      {!datacenter ? (
        <Select
          value={selectedDC?.abbr}
          onChange={abbr => {
            setSelectedDC(datacenters.find(dc => dc.abbr === abbr) ?? null);
          }}
          style={{ width: 300 }}
        >
          {Object.values(datacenters).map((ds, idx) => (
            <Option key={idx} value={ds.abbr}>
              {`${ds.name} (${ds.abbr})`}
            </Option>
          ))}
        </Select>
      ) : (
        <span>{datacenter.abbr}</span>
      )}
      {finalSelectedDC && (
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
            <CreateTooltip
              isVisible={!isAdmin || !range}
              tooltipText={textCreate}
            >
              <Button
                disabled={!isAdmin || !range}
                type="primary"
                style={{ marginRight: 8 }}
                onClick={() => create(range)}
              >
                Create
              </Button>
            </CreateTooltip>
            <CreateTooltip
              isVisible={!isAdmin || !range}
              tooltipText={textDelete}
            >
              <Button
                disabled={!isAdmin || !range}
                type="danger"
                style={{ marginRight: 8 }}
                onClick={() => remove(range)}
              >
                Remove
              </Button>
            </CreateTooltip>
            <CreateTooltip
              isVisible={!range}
              tooltipText={"Select range to open printable rack view"}
            >
              <Button
                disabled={selectedRacks.length == 0}
                type="default"
                onClick={() => showRacks(selectedRacks)}
              >
                View
              </Button>
            </CreateTooltip>
            {warnings.length > 0 && (
              <>
                <VSpace height="16px" />
                <Alert
                  closable
                  type="warning"
                  message={
                    <div>
                      {warnings.map((warn, idx) => (
                        <p key={idx}>{warn}</p>
                      ))}
                    </div>
                  }
                />
              </>
            )}
            {errors.length > 0 && (
              <>
                <VSpace height="16px" />
                <Alert
                  closable
                  type="error"
                  message={
                    <div>
                      {errors.map((err, idx) => (
                        <p key={idx}>{err}</p>
                      ))}
                    </div>
                  }
                />
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RackManagementPage;
