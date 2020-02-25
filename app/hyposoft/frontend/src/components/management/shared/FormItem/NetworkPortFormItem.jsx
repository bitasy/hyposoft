import React from "react";
import { Form, Select, Row, Col } from "antd";
import { FORM_ITEM_LAYOUT } from "./FormItem";
import API from "../../../../api/API";
import produce from "immer";

export function constructDefaultPorts(model) {
  return model.network_port_labels.map(label => {
    return {
      label,
      connection: null
    };
  });
}

function uniqueByKey(arr, extractKey) {
  const s = new Set();
  return arr.reduce((acc, elm) => {
    const key = extractKey(elm);
    if (!s.has(key)) {
      acc.push(elm);
      s.add(key);
    }
    return acc;
  }, []);
}

function NetworkPortFormItem({
  form,
  schemaFrag,
  originalValue,
  currentRecord,
  onChange,
  disabled
}) {
  const initialValue = originalValue || schemaFrag.defaultValue;

  const dcID = currentRecord.datacenter;
  const model = currentRecord.model;

  const actualInitialValue =
    initialValue || (model && constructDefaultPorts(model));

  const [allPorts, setAllPorts] = React.useState([]);
  const [freePorts, setFreePorts] = React.useState([]);

  React.useEffect(() => {
    if (dcID) {
      API.getFreeNetworkPorts(dcID).then(setFreePorts);
      API.getAllNetworkPorts(dcID).then(setAllPorts);
    }
  }, [dcID]);

  if (!model || !dcID) return null;

  return (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        initialValue: actualInitialValue
      })(
        <Input
          onChange={v => {
            onChange({ [schemaFrag.fieldName]: v });
          }}
          disabled={disabled}
          freePorts={freePorts}
          allPorts={allPorts}
          assetID={currentRecord.id}
        />
      )}
    </Form.Item>
  );
}

const Input = React.forwardRef(
  ({ value, onChange, disabled, freePorts, allPorts, assetID }, ref) => {
    const residue = allPorts.filter(p => p.asset === assetID);

    return (
      <div ref={ref}>
        {value.map((networkPort, idx) => {
          const currentConn = allPorts.find(
            p => p.id === networkPort.connection?.id
          );

          const options = uniqueByKey(
            currentConn
              ? [currentConn, ...freePorts, ...residue]
              : [...freePorts, ...residue],
            c => c.id
          ).filter(p => p.asset != assetID);

          return (
            <NetworkPortInput
              key={idx}
              networkPort={networkPort}
              options={options}
              disabled={disabled}
              onChange={v =>
                onChange(
                  produce(value, draft => {
                    draft[idx].connection = v;
                  })
                )
              }
            />
          );
        })}
      </div>
    );
  }
);

function NetworkPortInput({ networkPort, options, disabled, onChange }) {
  const idx = options.findIndex(fp => fp.id == networkPort.connection?.id);

  return (
    <div style={{ marginTop: 8 }}>
      <p style={{ marginBottom: 4 }}>{`${networkPort.label.name}: `}</p>
      <Select
        showSearch
        allowClear
        disabled={disabled}
        value={idx >= 0 ? idx.toString() : ""}
        onChange={v => onChange(options[parseInt(v)])}
        filterOption={(input, option) => {
          return option.props.children.includes(input);
        }}
      >
        {options.map((fp, idx) => {
          const label = `${fp.asset_str}: ${fp.label.name}`;
          return (
            <Select.Option key={idx} title={label}>
              {label}
            </Select.Option>
          );
        })}
      </Select>
    </div>
  );
}

export default NetworkPortFormItem;
