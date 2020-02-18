import React from "react";
import { Form, Switch, Input, InputNumber, Row, Col } from "antd";
import { FORM_ITEM_LAYOUT } from "./FormItem";
import produce from "immer";

function NetworkPortLabelFormItem({
  form,
  schemaFrag,
  originalValue,
  currentRecord,
  onChange,
  disabled
}) {
  const initialValue = originalValue || schemaFrag.defaultValue;

  return (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
      {form.getFieldDecorator(schemaFrag.fieldName, { initialValue })(
        <SwitchingInput
          onChange={v => onChange({ [schemaFrag.fieldName]: v })}
          disabled={disabled}
        />
      )}
    </Form.Item>
  );
}

const SwitchingInput = React.forwardRef(
  ({ value, onChange, disabled }, ref) => {
    const networkPorts = value || [];

    return (
      <div ref={ref}>
        <div>
          <Row>
            <span># of Network Ports: </span>
            <InputNumber
              min={0}
              value={networkPorts.length}
              readOnly={disabled}
              onChange={v => {
                onChange(
                  produce(value, draft => {
                    if (v < draft.length) {
                      draft.splice(v, draft.length - v);
                    } else {
                      for (let i = draft.length; i < v; i++) {
                        draft.push((i + 1).toString());
                      }
                    }
                    draft.length;
                  })
                );
              }}
            />
          </Row>
          {networkPorts.map((port, idx) => (
            <Input
              key={idx}
              style={{ marginTop: 4 }}
              value={port}
              readOnly={disabled}
              onChange={e =>
                onChange(
                  produce(value, draft => {
                    draft[idx] = e.target.value;
                  })
                )
              }
            />
          ))}
        </div>
      </div>
    );
  }
);

export default NetworkPortLabelFormItem;
