import React from "react";
import { Form, InputNumber } from "antd";
import { FORM_ITEM_LAYOUT } from "./FormItem";

function NumberFormItem({
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
        <InputNumber
          disabled={disabled}
          placeholder={schemaFrag.displayName}
          min={schemaFrag.min}
          onChange={v => onChange({ [schemaFrag.fieldName]: v })}
          style={{ width: "100%" }}
        />
      )}
    </Form.Item>
  );
}

export default NumberFormItem;
