import React from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchRacks } from "../../../../redux/racks/actions";
import { FORM_ITEM_LAYOUT } from "./FormItem";

function RackFormItem({
  form,
  schemaFrag,
  originalValue,
  currentRecord,
  onChange,
  disabled
}) {
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  const dispatch = useDispatch();
  const dcs = useSelector(s => s.datacenters);
  const rackList = useSelector(s => Object.values(s.racks));

  const dcID = currentRecord.datacenter;
  const dc = dcID && dcs[dcID];
  const dcName = dc?.abbr;

  React.useEffect(() => {
    dispatch(fetchRacks(dcName));
  }, [dcName]);

  if (!dcID || !dc) return null;

  const filteredRackList = rackList
    .filter(r => r.datacenter == dcID)
    .sort((r1, r2) => r1.rack.localeCompare(r2.rack));

  return (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT} key={dcID}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules,
        initialValue: originalValue && originalValue.id
      })(
        <Select
          showSearch
          disabled={disabled}
          onChange={v =>
            onChange({
              [schemaFrag.fieldName]: rackList.filter(m => m.id == v)[0]
            })
          }
          filterOption={(input, option) => {
            return option.props.children.includes(input);
          }}
        >
          {filteredRackList.map(rack => (
            <Select.Option key={rack.id} value={rack.id}>
              {rack.rack}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
}

export default RackFormItem;