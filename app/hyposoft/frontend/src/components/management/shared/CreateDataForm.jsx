import React from "react";
import { useHistory } from "react-router-dom";
import { Form, Button } from "antd";
import FormItem from "./FormItem";
import { useDispatch } from "react-redux";

function CreateDataForm({ form, createRecord, schema }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [newRecord, setNewRecord] = React.useState({});

  function handleSubmit(e) {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        dispatch(createRecord(newRecord, () => history.goBack()));
      }
    });
  }

  console.log(newRecord);

  return (
    <Form onSubmit={handleSubmit} layout="vertical" style={{ maxWidth: 600 }}>
      {schema.map(schemaFrag => (
        <FormItem
          key={schemaFrag.fieldName}
          form={form}
          schemaFrag={schemaFrag}
          currentRecord={newRecord}
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
