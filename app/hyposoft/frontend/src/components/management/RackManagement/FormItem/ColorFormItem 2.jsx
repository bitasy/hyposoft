import React from "react";
import { Form } from "antd";
import { ChromePicker } from "react-color";
import { FORM_ITEM_LAYOUT } from "./FormItem";

function ColorFormItem({
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

  const [value, setValue] = React.useState(initialValue);

  return (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules,
        initialValue
      })(
        <ChromePicker
          disableAlpha
          color={value}
          onChange={color => {
            if (disabled) return;
            setValue(color);
            onChange({ [schemaFrag.fieldName]: color.hex });
          }}
        />
      )}
    </Form.Item>
  );
}

export default ColorFormItem;
