import React from "react";
import { Form, InputNumber, Checkbox, Row } from "antd";
import { FORM_ITEM_LAYOUT } from "./FormItem";

function AutogenNumberFormItem({
  form,
  schemaFrag,
  originalValue,
  onChange,
  disabled
}) {
  const initialValue = originalValue || schemaFrag.defaultValue;

  React.useEffect(() => {
    onChange({ [schemaFrag.fieldName]: initialValue });
  }, []);

  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  return (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
      {form.getFieldDecorator(schemaFrag.fieldName, { rules, initialValue })(
        <Input
          disabled={disabled}
          minValue={schemaFrag.min}
          maxValue={schemaFrag.max}
          onChange={v => onChange({ [schemaFrag.fieldName]: v })}
          style={{ width: "100%" }}
        />
      )}
    </Form.Item>
  );
}

const Input = React.forwardRef(
  ({ minValue, maxValue, value, onChange, disabled }, ref) => {
    return (
      <div ref={ref}>
        <div>
          <Row>
            <span>Generate automatically? </span>
            <Checkbox
              checked={!value}
              disabled={disabled}
              onChange={e => {
                if (e.target.checked) {
                  onChange(null);
                } else {
                  onChange(minValue);
                }
              }}
            />
          </Row>
          <InputNumber
            style={{ marginTop: 4 }}
            value={value}
            disabled={disabled || !value}
            min={minValue}
            max={maxValue}
            onChange={n => onChange(n)}
          />
        </div>
      </div>
    );
  }
);

export default AutogenNumberFormItem;
