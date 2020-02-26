import React from "react";
import { useHistory } from "react-router-dom";
import { objectEquals } from "object-equals";
import { Form, Button, Icon, Tooltip } from "antd";
import { useDispatch } from "react-redux";
import FormItem from "./FormItem/FormItem";
import CreateTooltip from "../../../global/CreateTooltip";

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

  console.log("newRecord", newRecord);
  console.log("record", record);

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
          showPorts={newRecord["network_ports"].length > 0}
        />
      ))}
      <Form.Item>
        <CreateTooltip isVisible={disabled || !canUpdate} tooltipText={"test"}>
          <Button.Group style={{ width: "100%", display: "flex" }}>
            <Button
                    htmlType="submit"
                    disabled={disabled || !canUpdate}
                    style={{ flexGrow: 8 }}
                >
                  Update
            </Button>
            <Button
              htmlType="button"
              type="danger"
              onClick={handleDelete}
              disabled={disabled}
            >
              <Icon type="delete" />
            </Button>
          </Button.Group>
        </CreateTooltip>
      </Form.Item>
    </Form>
  ) : null;
}

const WrappedDataDetailForm = Form.create({ name: "detail_form" })(
  DataDetailForm
);

export default WrappedDataDetailForm;
