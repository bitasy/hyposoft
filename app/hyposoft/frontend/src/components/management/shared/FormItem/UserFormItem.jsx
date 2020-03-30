import React from "react";
import { Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../../../redux/users/actions";
import { FORM_ITEM_LAYOUT } from "./FormItem";

function UserFormItem({ form, schemaFrag, originalValue, onChange, disabled }) {
  const dispatch = useDispatch();

  const initialValue = originalValue && originalValue.id;

  const userList = useSelector(s =>
    Object.values(s.users).sort((u1, u2) =>
      u1.username.localeCompare(u2.username)
    )
  );
  const usersByID = useSelector(s => s.users);

  React.useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  return (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        initialValue: initialValue
      })(
        <Select
          allowClear
          showSearch
          disabled={disabled}
          onChange={v => {
            if (v === undefined) v = null;
            onChange({ [schemaFrag.fieldName]: v && usersByID[v] });
          }}
          filterOption={(input, option) => {
            return usersByID[option.props.value].username
              .toLowerCase()
              .includes(input.toLowerCase());
          }}
        >
          {userList.map(user => (
            <Select.Option key={user.id} value={user.id}>
              {user.username}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
}

export default UserFormItem;
