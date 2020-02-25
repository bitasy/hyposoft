import React from "react";
import { Form, InputNumber, Checkbox, Row, Select } from "antd";
import { FORM_ITEM_LAYOUT } from "./FormItem";
import API from "../../../../api/API";
import produce from "immer";

function PowerPortFormItem({
  form,
  schemaFrag,
  originalValue,
  currentRecord,
  onChange,
  disabled
}) {
  const initialValue = originalValue || schemaFrag.defaultValue;

  const [freePorts, setFreePorts] = React.useState(null);

  const rack = currentRecord.rack;
  React.useEffect(() => {
    onChange({ [schemaFrag.fieldName]: initialValue });
  }, [rack?.id]);
  React.useEffect(() => {
    if (currentRecord.rack) {
      API.getFreePowerPorts(currentRecord.rack.id, currentRecord.id)
        .then(flatten)
        .then(setFreePorts);
    } else {
      setFreePorts(null);
    }
  }, [rack?.id, currentRecord.id]);

  if (!rack) return null;

  return (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
      {form.getFieldDecorator(schemaFrag.fieldName, { initialValue })(
        <Input
          disabled={disabled}
          currentRecord={currentRecord}
          pdus={currentRecord.rack?.pdu_set || []}
          freePorts={freePorts}
          onChange={v => onChange({ [schemaFrag.fieldName]: v })}
          style={{ width: "100%" }}
        />
      )}
    </Form.Item>
  );
}

// freePorts: { pduID: position[] }
// returns: [pduID, position][]
function flatten(freePorts) {
  return Object.entries(freePorts)
    .map(([pduID, positions]) => positions.map(p => [pduID, p]))
    .reduce((acc, lst) => [...acc, ...lst], []);
}

// freePorts: [pduID, position][]
// pdus = PDU[]
// returns: [pduID, position, name][]
function nameFreePorts(freePorts, pdus) {
  return freePorts.map(([pduID, position]) => {
    return [
      pduID,
      position,
      (pdus.find(pdu => pdu.id == pduID)?.position || "") + position
    ];
  });
}

function flatList(lst) {
  return lst.reduce((acc, elm) => [...acc, ...elm], []);
}

// numPorts: number
// freePorts: [pduID, position, name][]
// currentSelections: {pdu_id, position}[]
// returns: [{pdu_id, position}[] of size numPorts, suggestion indices]
function suggestion(numPorts, freePorts, currentSelections) {
  const groupByPosition = freePorts.reduce((acc, elm) => {
    const toPut = acc[elm[1]] || [];
    toPut.push(elm);
    acc[elm[1]] = toPut;
    return acc;
  }, {});

  console.log("groupByPosition", groupByPosition);

  const doubles = Object.entries(groupByPosition)
    .filter(([, group]) => group.length >= 2)
    .sort((a, b) => a[0] - b[0]);

  if (doubles.length == 0) {
    // no doubles, so just list them out in sequence
    return freePorts.reduce(
      ([acc, suggestions], fp, idx) => {
        if (
          acc.length < numPorts &&
          !acc.find(
            ({ pdu_id, position }) => pdu_id == fp[0] && position === fp[1]
          )
        ) {
          acc.push({ pdu_id: fp[0], position: fp[1] });
          suggestions.push(idx);
        }
        return [acc, suggestions];
      },
      [[...currentSelections], []]
    );
  } else {
    return flatList(doubles.map(([, v]) => v)).reduce(
      ([acc, suggestions], fp) => {
        if (
          acc.length < numPorts &&
          !acc.find(
            ({ pdu_id, position }) => pdu_id == fp[0] && position === fp[1]
          )
        ) {
          acc.push({ pdu_id: fp[0], position: fp[1] });
          suggestions.push(
            freePorts.findIndex(p => p[0] == fp[0] && p[1] == fp[1])
          );
        }
        return [acc, suggestions];
      },
      [[...currentSelections], []]
    );
  }
}

const Input = React.forwardRef(
  ({ value, onChange, disabled, pdus, freePorts, currentRecord }, ref) => {
    if (!currentRecord.model || !freePorts) return null;

    const numPowerPorts = currentRecord.model.power_ports || 0;

    const namedFreePorts = nameFreePorts(freePorts, pdus).sort(
      (a, b) => a[1] - b[1]
    );

    const [valuesWithSuggestions, suggestions] = React.useMemo(
      () => suggestion(numPowerPorts, namedFreePorts, value),
      [freePorts]
    );

    const valueIndices = valuesWithSuggestions
      .map(({ pdu_id, position }) =>
        namedFreePorts.findIndex(([id, p]) => pdu_id == id && position === p)
      )
      .filter(idx => idx >= 0)
      .map(idx => idx.toString());

    React.useEffect(() => {
      setTimeout(() => {
        onChange(
          valueIndices.map(idx => {
            const [pduID, position] = namedFreePorts[parseInt(idx)];
            return { pdu_id: parseInt(pduID), position };
          })
        );
      }, 500); // ugh... nasty
    }, []);

    const [errMsg, setErrMsg] = React.useState("");

    return (
      <div ref={ref}>
        <p style={{ color: "orange" }}>
          When switching racks, clear these out first, update, and then change
          these fields
        </p>
        <Select
          showSearch
          mode="multiple"
          disabled={disabled}
          defaultValue={valueIndices}
          optionLabelProp="label"
          onChange={v => {
            if (v.length <= numPowerPorts) {
              setErrMsg("");

              onChange(
                v.map(idx => {
                  const [pduID, position] = namedFreePorts[parseInt(idx)];
                  return { pdu_id: parseInt(pduID), position };
                })
              );
            } else {
              setErrMsg(`Can't pick more than ${numPowerPorts}`);
            }
          }}
          filterOption={(input, option) => {
            return option.props.children.includes(input);
          }}
        >
          {namedFreePorts.map(([pduID, position, name], idx) => {
            const label = suggestions.includes(idx) ? name + " *" : name;
            return (
              <Select.Option key={idx} label={label}>
                {label}
              </Select.Option>
            );
          })}
        </Select>
        <div>
          <span style={{ color: "red" }}>{errMsg}</span>
        </div>
      </div>
    );
  }
);

export default PowerPortFormItem;
