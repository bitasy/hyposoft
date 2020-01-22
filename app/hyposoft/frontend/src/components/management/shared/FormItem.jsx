import React from "react";
import { Form, Input, InputNumber, Select } from "antd";
import { ChromePicker } from "react-color";
import API from "../../../api/API";
import Rack from "./Rack";
import InstancePositionPicker from "./InstancePositionPicker";

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

function StringFormItem({ form, schemaFrag, originalValue, onChange }) {
  const initialValue = originalValue || schemaFrag.defaultValue;

  React.useEffect(() => {
    onChange({ [schemaFrag.fieldName]: initialValue });
  }, []);

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

  React.useEffect(() => {
    onChange({ [schemaFrag.fieldName]: initialValue });
  }, []);

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

  React.useEffect(() => {
    onChange({ [schemaFrag.fieldName]: initialValue });
  }, []);

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

  React.useEffect(() => {
    onChange({ [schemaFrag.fieldName]: initialValue });
  }, []);

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
        initialValue: originalValue && originalValue.id
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

function RackUFormItem({
  form,
  schemaFrag,
  originalValue,
  currentRecord,
  onChange
}) {
  const initialValue = originalValue || schemaFrag.defaultValue;
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  const [instances, setInstances] = React.useState([]);

  React.useEffect(() => {
    API.getInstancesForRack(currentRecord.rack).then(instances =>
      setInstances(instances.filter(i => i.id !== currentRecord.id))
    );
  }, [currentRecord.rack]);

  const rack = {
    height: 42, // fixed for now
    name: currentRecord.rack,
    instances: instances
  };

  return currentRecord.model ? (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules,
        initialValue: initialValue
      })(
        <InstancePositionPicker
          rack={rack}
          model={currentRecord.model}
          onSelect={(instance, level) => {
            onChange({
              [schemaFrag.fieldName]: level
            });
            form.setFieldsValue({
              [schemaFrag.fieldName]: level
            });
          }}
        />
      )}
    </Form.Item>
  ) : null;
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
  ) : props.schemaFrag.type === "rack_u" ? (
    <RackUFormItem {...props} />
  ) : null;
}

export default FormItem;
