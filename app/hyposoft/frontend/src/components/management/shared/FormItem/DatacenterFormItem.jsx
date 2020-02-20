import { FORM_ITEM_LAYOUT } from "./FormItem";
import React from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
// import { fetchDatacenters } from "../../../../redux/datacenters/actions";

function DatacenterFormItem({
  form,
  schemaFrag,
  originalValue,
  onChange,
  disabled
}) {
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  // const dispatch = useDispatch();

  const initialValue = originalValue && originalValue.toString();

  const dcs = useSelector(s => Object.values(s.datacenters));
  // React.useEffect(() => {
  //   dispatch(fetchDatacenters());
  // }, []);

  return (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
      {form.getFieldDecorator(schemaFrag.fieldName, { rules, initialValue })(
        <Select
          showSearch
          disabled={disabled}
          onChange={v => {
            onChange({
              [schemaFrag.fieldName]: v,
              rack: null,
              rack_u: null
            });
            form.setFieldsValue({
              rack: null,
              rack_u: null
            });
          }}
          filterOption={(input, option) => {
            const dc = dcs.find(dc => dc.id.toString() === option.key);
            if (!dc) return false;

            return dc.abbr.includes(input) || dc.name.includes(input);
          }}
        >
          {dcs.map(dc => (
            <Select.Option key={dc.id}>
              {`${dc.name} (${dc.abbr})`}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
}

export default DatacenterFormItem;
