import React from "react";
import { Form } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssets } from "../../../../redux/assets/actions";
import { FORM_ITEM_LAYOUT } from "./FormItem";
import AssetPositionPicker from "../AssetPositionPicker";

function RackUFormItem({
  form,
  schemaFrag,
  originalValue,
  currentRecord,
  onChange,
  disabled
}) {
  const initialValue = originalValue || schemaFrag.defaultValue;
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(fetchAssets());
  }, []);

  const assets = useSelector(s => Object.values(s.assets));

  const filteredAssets = currentRecord.rack
    ? assets.filter(
        i => i.rack.id === currentRecord.rack.id && i.id != currentRecord.id
      )
    : [];

  const rack = {
    height: 42, // fixed for now
    name: currentRecord.rack ? currentRecord.rack.rack : "",
    assets: filteredAssets
  };

  return currentRecord.model && currentRecord.rack ? (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules,
        initialValue: initialValue
      })(
        <AssetPositionPicker
          key={currentRecord.rack.id}
          rack={rack}
          model={currentRecord.model}
          hostname={currentRecord.hostname}
          disabled={disabled}
          onSelect={(instance, level) => {
            onChange({
              [schemaFrag.fieldName]: level
            });
            form.setFieldsValue({
              [schemaFrag.fieldName]: level
            });
          }}
          onValidation={isValid => {
            if (!isValid) {
              form.setFields({
                [schemaFrag.fieldName]: {
                  value: null,
                  errors: [new Error("Invalid position!")]
                }
              });
            }
          }}
        />
      )}
    </Form.Item>
  ) : null;
}

export default RackUFormItem;
