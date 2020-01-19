import React from "react";
import { useHistory } from "react-router-dom";
import { Form, Button } from "antd";
import FormItem from "./FormItem";

function CreateDataForm({ form, createRecord, schema }) {
  const [newRecord, setNewRecord] = React.useState({});
  const history = useHistory();

  function handleSubmit(e) {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        createRecord(newRecord).then(history.goBack());
      }
    });
  }

  return (
    <Form onSubmit={handleSubmit} layout="vertical" style={{ maxWidth: 600 }}>
      {schema.map(schemaFrag => (
        <FormItem
          key={schemaFrag.fieldName}
          form={form}
          schemaFrag={schemaFrag}
          onChange={changeSet =>
            setNewRecord(Object.assign(newRecord, changeSet))
          }
        />
      ))}
      <Form.Item>
        <Button style={{ width: "100%" }} htmlType="submit">
          Create
        </Button>
      </Form.Item>
    </Form>
  );
}

const WrappedCreateDataForm = Form.create({ name: "create_data_form" })(
  CreateDataForm
);

export default WrappedCreateDataForm;
