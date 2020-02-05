import React from "react";
import { Form, Input } from "antd";
import { MAX_ROW, MAX_COL } from "./RackManagementPage";
import {
  split,
  rowToIndex,
  toIndex,
  indexToRow,
  indexToCol
} from "./GridUtils";

// initialValue: [r1, r2, c1, c2]
// onChange: ([r1, r2, c1, c2] | null) => ()
// clearTrigger: 0 | 1
function GridRangeSelector({ initialValue, onChange, clearTrigger }) {
  const initialP1 = initialValue
    ? indexToRow(initialValue[0]) + indexToCol(initialValue[2])
    : "";

  const initialP2 = initialValue
    ? indexToRow(initialValue[1]) + indexToCol(initialValue[3])
    : "";

  const [p1, setP1] = React.useState(initialP1);
  const [p2, setP2] = React.useState(initialP2);

  const firstTime = React.useRef(true);
  React.useEffect(() => {
    if (!firstTime.current) {
      setP1("");
      setP2("");
    }
    firstTime.current = false;
  }, [clearTrigger]);

  React.useEffect(() => {
    setP1(initialP1);
    setP2(initialP2);
  }, [initialP1, initialP2]);

  React.useEffect(() => {
    if (p1Error == null && p2Error == null) {
      onChange(destructure(p1, p2));
    } else {
      onChange(null);
    }
  }, [p1, p2]);

  const [p1ErrMsg, setP1ErrMsg] = React.useState("");
  const [p2ErrMsg, setP2ErrMsg] = React.useState("");

  const p1Error = validate(p1);
  const p2Error = validate(p2);

  return (
    <Form style={{ width: 350 }}>
      <Form.Item
        extra={p1ErrMsg}
        validateStatus={p1ErrMsg.length > 0 ? "error" : "success"}
      >
        <Input
          addonBefore={"Point 1"}
          placeholder="A2"
          value={p1}
          onChange={e => {
            const str = e.target.value;
            const error = isValidSubstr(str);
            if (error == null) {
              setP1(str);
              setP1ErrMsg("");
            } else setP1ErrMsg(error);
          }}
        />
      </Form.Item>
      <Form.Item
        extra={p2ErrMsg}
        validateStatus={p2ErrMsg.length > 0 ? "error" : "success"}
      >
        <Input
          addonBefore={"Point 2"}
          placeholder="B20"
          value={p2}
          onChange={e => {
            const str = e.target.value;
            const error = isValidSubstr(str);
            if (error == null) {
              setP2(str);
              setP2ErrMsg("");
            } else setP2ErrMsg(error);
          }}
        />
      </Form.Item>
    </Form>
  );
}

// these validation functions return an error string when there's a problem
// and returns null when there's not

function validate(s) {
  if (s.length < 2) return "";
  const [rStr, cStr] = split(s, 1);

  if (isNaN(cStr)) return "Use numbers to represent columns";

  const [r, c] = toIndex(rStr + cStr);

  if (r < 0 || r >= MAX_ROW) return "Row out of bounds";
  if (c < 0 || c >= MAX_COL) return "Column out of bounds";

  return null;
}

function isValidSubstr(s) {
  if (s.length == 0) {
    return null;
  } else if (s.length == 1) {
    const r = rowToIndex(s);
    if (0 <= r && r < MAX_ROW) return null;
    else {
      return "The first character must be a character between A-Z!";
    }
  } else {
    return validate(s);
  }
}

function destructure(p1, p2) {
  const [r1, c1] = toIndex(p1);
  const [r2, c2] = toIndex(p2);

  return [
    Math.min(r1, r2),
    Math.max(r1, r2),
    Math.min(c1, c2),
    Math.max(c1, c2)
  ];
}

export default GridRangeSelector;
