import React from "react";
import { Form, Input } from "antd";
import { FORM_ITEM_LAYOUT } from "./FormItem";

function TextAreaFormItem({
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
        <Input.TextArea
          disabled={disabled}
          placeholder={schemaFrag.displayName}
          rows={5}
          onChange={e => onChange({ [schemaFrag.fieldName]: e.target.value })}
        />
      )}
    </Form.Item>
  );
}

export default TextAreaFormItem;
