import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { objectEquals } from "object-equals";
import { Form, Button, Icon } from "antd";
import FormItem from "./FormItem";

function DataDetailForm({
  form,
  getRecord,
  updateRecord,
  deleteRecord,
  schema
}) {
  const { id } = useParams();
  const [record, setRecord] = React.useState(null);
  const [newRecord, setNewRecord] = React.useState(null);

  const history = useHistory();

  const canUpdate = !objectEquals(record, newRecord);

  function fetchRecord(id) {
    getRecord(id).then(rec => {
      setNewRecord(JSON.parse(JSON.stringify(rec)));
      setRecord(rec);
    });
  }

  React.useEffect(() => {
    fetchRecord(id);
  }, [id]);

  function handleSubmit(e) {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        if (confirm("You sure?")) {
          updateRecord(id, newRecord).then(() => fetchRecord(id));
        }
      }
    });
  }

  function handleDelete(e) {
    e.preventDefault();
    if (confirm("You sure?")) {
      deleteRecord(id).then(() => history.goBack());
    }
  }

  return (
    record && (
      <Form onSubmit={handleSubmit} layout="vertical" style={{ width: 400 }}>
        {schema.map(schemaFrag => (
          <FormItem
            key={schemaFrag.fieldName}
            form={form}
            schemaFrag={schemaFrag}
            originalValue={record[schemaFrag.fieldName]}
            onChange={changeSet => {
              setNewRecord(Object.assign(newRecord, changeSet));
            }}
          />
        ))}
        <Form.Item>
          <Button.Group style={{ width: "100%", display: "flex" }}>
            <Button
              htmlType="submit"
              disabled={!canUpdate}
              style={{ flexGrow: 8 }}
            >
              Update
            </Button>
            <Button htmlType="button" type="danger" onClick={handleDelete}>
              <Icon type="delete" />
            </Button>
          </Button.Group>
        </Form.Item>
      </Form>
    )
  );
}

const WrappedDataDetailForm = Form.create({ name: "detail_form" })(
  DataDetailForm
);

export default WrappedDataDetailForm;
