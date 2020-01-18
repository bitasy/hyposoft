import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { objectEquals } from "object-equals";
import { Form, Button, Input, InputNumber, Icon } from "antd";
import { ChromePicker } from "react-color";

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

function FormItem({ form, schemaFrag, originalValue, onChange }) {
  const initialValue = originalValue || schemaFrag.defaultValue;
  const [value, setValue] = React.useState(initialValue); // used only on certain cases

  console.log(form, schemaFrag, originalValue);

  return (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules: schemaFrag.required
          ? [{ required: true, message: "This field is required" }]
          : [],
        initialValue: initialValue
      })(
        schemaFrag.type === "string" ? (
          <Input
            placeholder={schemaFrag.displayName}
            onChange={e => onChange({ [schemaFrag.fieldName]: e.target.value })}
          />
        ) : schemaFrag.type === "number" ? (
          <InputNumber
            placeholder={schemaFrag.displayName}
            min={schemaFrag.min}
            onChange={v => onChange({ [schemaFrag.fieldName]: v })}
            style={{ width: "100%" }}
          />
        ) : schemaFrag.type === "color-string" ? (
          <ChromePicker
            color={value}
            onChange={color => {
              setValue(color);
              onChange({ [schemaFrag.fieldName]: color.hex });
            }}
          />
        ) : schemaFrag.type === "multiline-string" ? (
          <Input.TextArea
            placeholder={schemaFrag.displayName}
            rows={5}
            onChange={e => onChange({ [schemaFrag.fieldName]: e.target.value })}
          />
        ) : null
      )}
    </Form.Item>
  );
}

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
      setRecord(rec);
      setNewRecord(Object.assign({}, rec));
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
          updateRecord(id, values).then(() => fetch(id));
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
            onChange={changeSet =>
              setNewRecord(Object.assign(newRecord, changeSet))
            }
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
