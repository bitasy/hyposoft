import React from "react";
import { Form, AutoComplete } from "antd";
import { useSelector } from "react-redux";
import { FORM_ITEM_LAYOUT } from "./FormItem";

function StringFormItem({
  form,
  schemaFrag,
  originalValue,
  onChange,
  disabled
}) {
  const initialValue = originalValue || schemaFrag.defaultValue;

  const extractDS = schemaFrag.extractDataSource;
  const dataSource = useSelector(s => (extractDS != null ? extractDS(s) : []));

  React.useEffect(() => {
    onChange({ [schemaFrag.fieldName]: initialValue });
  }, []);

  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  return (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules,
        initialValue: initialValue.toString()
      })(
        <AutoComplete
          disabled={disabled}
          dataSource={dataSource}
          filterOption={(input, option) => option.key.includes(input)}
          onChange={v => {
            onChange({ [schemaFrag.fieldName]: v });
          }}
        />
      )}
    </Form.Item>
  );
}

export default StringFormItem;
