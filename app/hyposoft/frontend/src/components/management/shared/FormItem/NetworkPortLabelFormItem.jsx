import React from "react";
import { Form, Switch, Input, InputNumber, Row, Col } from "antd";
import { FORM_ITEM_LAYOUT } from "./FormItem";
import produce from "immer";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssets } from "../../../../redux/assets/actions";

function NetworkPortLabelFormItem({
  form,
  schemaFrag,
  originalValue,
  currentRecord,
  onChange,
  disabled
}) {
  const initialValue = originalValue || schemaFrag.defaultValue;
  const dispatch = useDispatch();

  const assets = useSelector(s => Object.values(s.assets));
  React.useEffect(() => {
    dispatch(fetchAssets());
  }, []);

  const instanceExists = !!assets.find(a => a.model.id == currentRecord.id);

  const actuallyDisabled = disabled || instanceExists;

  return (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
      {form.getFieldDecorator(schemaFrag.fieldName, { initialValue })(
        <SwitchingInput
          onChange={v => onChange({ [schemaFrag.fieldName]: v })}
          disabled={actuallyDisabled}
          instanceExists={instanceExists}
        />
      )}
    </Form.Item>
  );
}

const SwitchingInput = React.forwardRef(
  ({ value, onChange, disabled, instanceExists }, ref) => {
    const networkPorts = value || [];

    return (
      <div ref={ref}>
        <div>
          {instanceExists ? (
            <p style={{ color: "orange" }}>
              Can't change these when there are instances of this model
            </p>
          ) : null}
          <Row>
            <span># of Network Ports: </span>
            <InputNumber
              min={0}
              value={networkPorts.length}
              disabled={disabled}
              onChange={v => {
                onChange(
                  produce(value || [], draft => {
                    if (v < draft.length) {
                      draft.splice(v, draft.length - v);
                    } else {
                      for (let i = draft.length; i < v; i++) {
                        draft.push({
                          name: (i + 1).toString()
                        });
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
              value={port.name}
              disabled={disabled}
              onChange={e =>
                onChange(
                  produce(value, draft => {
                    draft[idx].name = e.target.value;
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
