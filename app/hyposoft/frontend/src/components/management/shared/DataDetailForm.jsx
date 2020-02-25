import React from "react";
import { useHistory } from "react-router-dom";
import { objectEquals } from "object-equals";
import { Form, Button, Icon, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import FormItem from "./FormItem/FormItem";

function DataDetailForm({
  form,
  record,
  updateRecord,
  deleteRecord,
  schema,
  disabled
}) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [newRecord, setNewRecord] = React.useState(null);

  React.useEffect(() => {
    record && setNewRecord(Object.assign({}, record));
  }, [record]);

  const canUpdate = !objectEquals(record, newRecord);

  function handleSubmit(e) {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        if (confirm("You sure?")) {
          dispatch(updateRecord(record.id, newRecord));
        }
      }
    });
  }

  function handleDelete(e) {
    e.preventDefault();
    if (confirm("You sure?")) {
      dispatch(deleteRecord(record.id, () => history.goBack()));
    }
  }

  console.log(newRecord);

  return record && newRecord ? (
    <Form onSubmit={handleSubmit} layout="vertical" style={{ maxWidth: 600 }}>
      {schema.map((schemaFrag, idx) => (
        <FormItem
          key={idx}
          form={form}
          schemaFrag={schemaFrag}
          originalValue={record[schemaFrag.fieldName]}
          currentRecord={newRecord}
          onChange={changeSet => {
            setNewRecord(Object.assign(newRecord, changeSet));
          }}
          disabled={disabled}
        />
      ))}
      <Form.Item>
        <Button.Group style={{ width: "100%", display: "flex" }}>
          <Tooltip placement="right" title={"Edit a field before clicking update"}>
            <Button
              htmlType="submit"
              disabled={disabled || !canUpdate}
              style={{ flexGrow: 8 }}
            >
              Update
            </Button>
          </Tooltip>
          <Button
            htmlType="button"
            type="danger"
            onClick={handleDelete}
            disabled={disabled}
          >
            <Icon type="delete" />
          </Button>
        </Button.Group>
      </Form.Item>
    </Form>
  ) : null;
}

const WrappedDataDetailForm = Form.create({ name: "detail_form" })(
  DataDetailForm
);

export default WrappedDataDetailForm;
