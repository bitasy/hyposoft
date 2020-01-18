import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { objectEquals } from "object-equals";
import { Form, Button, Input, InputNumber, Icon, Select } from "antd";
import { ChromePicker } from "react-color";
import API from "../../../api/API";

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

function StringFormItem({ form, schemaFrag, originalValue, onChange }) {
  const initialValue = originalValue || schemaFrag.defaultValue;
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  return (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, { rules, initialValue })(
        <Input
          placeholder={schemaFrag.displayName}
          onChange={e => onChange({ [schemaFrag.fieldName]: e.target.value })}
        />
      )}
    </Form.Item>
  );
}

function NumberFormItem({ form, schemaFrag, originalValue, onChange }) {
  const initialValue = originalValue || schemaFrag.defaultValue;
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  return (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, { rules, initialValue })(
        <InputNumber
          placeholder={schemaFrag.displayName}
          min={schemaFrag.min}
          onChange={v => onChange({ [schemaFrag.fieldName]: v })}
          style={{ width: "100%" }}
        />
      )}
    </Form.Item>
  );
}

function ColorFormItem({ form, schemaFrag, originalValue, onChange }) {
  const initialValue = originalValue || schemaFrag.defaultValue;
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  const [value, setValue] = React.useState(initialValue);

  return (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules,
        initialValue
      })(
        <ChromePicker
          color={value}
          onChange={color => {
            setValue(color);
            onChange({ [schemaFrag.fieldName]: color.hex });
          }}
        />
      )}
    </Form.Item>
  );
}

function TextAreaFormItem({ form, schemaFrag, originalValue, onChange }) {
  const initialValue = originalValue || schemaFrag.defaultValue;
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  return (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, { rules, initialValue })(
        <Input.TextArea
          placeholder={schemaFrag.displayName}
          rows={5}
          onChange={e => onChange({ [schemaFrag.fieldName]: e.target.value })}
        />
      )}
    </Form.Item>
  );
}

function ModelFormItem({ form, schemaFrag, originalValue, onChange }) {
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  const [modelList, setModelList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    API.getModels().then(models => {
      setModelList(models);
      setLoading(false);
    });
  }, []);

  return (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules,
        initialValue: originalValue.id
      })(
        <Select
          loading={loading}
          onChange={v =>
            onChange({
              [schemaFrag.fieldName]: modelList.filter(m => m.id === v)[0]
            })
          }
        >
          {modelList.map(model => (
            <Select.Option key={model.id} value={model.id}>
              {model.vendor + " · " + model.model_number}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
}

function FormItem(props) {
  return props.schemaFrag.type === "string" ? (
    <StringFormItem {...props} />
  ) : props.schemaFrag.type === "number" ? (
    <NumberFormItem {...props} />
  ) : props.schemaFrag.type === "color-string" ? (
    <ColorFormItem {...props} />
  ) : props.schemaFrag.type === "multiline-string" ? (
    <TextAreaFormItem {...props} />
  ) : props.schemaFrag.type === "model" ? (
    <ModelFormItem {...props} />
  ) : null;
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
      setNewRecord(JSON.parse(JSON.stringify(rec)));
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
