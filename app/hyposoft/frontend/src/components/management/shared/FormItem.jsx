import React from "react";
import { useHistory } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Icon,
  Row,
  Col,
  AutoComplete
} from "antd";
import { ChromePicker } from "react-color";
import API from "../../../api/API";
import InstancePositionPicker from "./InstancePositionPicker";
import { rackToString } from "../InstanceManagement/InstanceSchema";
import { modelKeywordMatch } from "../ModelManagement/ModelSchema";

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

function StringFormItem({ form, schemaFrag, originalValue, onChange }) {
  const initialValue = originalValue || schemaFrag.defaultValue;

  const [value, setValue] = React.useState(initialValue);
  const [suggestions, setSuggestions] = React.useState([]);

  React.useEffect(() => {
    const ac = schemaFrag.autocomplete;
    ac && ac(value).then(setSuggestions);
  }, [value]);

  React.useEffect(() => {
    onChange({ [schemaFrag.fieldName]: initialValue });
  }, []);

  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  return (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, { rules, initialValue })(
        <AutoComplete
          placeholder={schemaFrag.displayName}
          dataSource={suggestions}
          onChange={v => {
            onChange({ [schemaFrag.fieldName]: v });
            setValue(v);
          }}
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

function RackFormItem({ form, schemaFrag, originalValue, onChange }) {
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  const [rackList, setRackList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    API.getRacks().then(racks => {
      setRackList(racks);
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
              [schemaFrag.fieldName]: rackList.filter(m => m.id === v)[0]
            })
          }
        >
          {rackList.map(rack => (
            <Select.Option key={rack.id} value={rack.id}>
              {rack.row + rack.number}
            </Select.Option>
          ))}
        </Select>
      )}
    </Form.Item>
  );
}

function groupByID(arr) {
  return arr.reduce((acc, elm) => Object.assign(acc, { [elm.id]: elm }), {});
}

function ModelFormItem({ form, schemaFrag, originalValue, onChange }) {
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  const history = useHistory();

  const initialValue = originalValue && originalValue.id;

  const [modelList, setModelList] = React.useState([]);
  const [modelsByID, setModelsByID] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    API.getModels().then(models => {
      setModelList(models);
      setModelsByID(groupByID(models));
      setLoading(false);
    });
  }, []);

  const selectedModelID = form.getFieldValue(schemaFrag.fieldName);

  return (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      <Row align="middle" type="flex" gutter={8}>
        <Col span={22}>
          {form.getFieldDecorator(schemaFrag.fieldName, {
            rules,
            initialValue: initialValue
          })(
            <Select
              showSearch
              loading={loading}
              onChange={v => {
                onChange({ [schemaFrag.fieldName]: modelsByID[v] });
              }}
              filterOption={(input, option) => {
                return modelKeywordMatch(input, modelsByID[option.props.value]);
              }}
            >
              {modelList.map(model => (
                <Select.Option key={model.id} value={model.id}>
                  {model.vendor + " · " + model.model_number}
                </Select.Option>
              ))}
            </Select>
          )}
        </Col>
        <Col span={2}>
          <Button
            size="small"
            shape="circle"
            disabled={selectedModelID == null}
            style={{ marginTop: "auto", marginBottom: "auto" }}
            onClick={() => history.push(`/models/${selectedModelID}`)}
          >
            <Icon type="link" />
          </Button>
        </Col>
      </Row>
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
    if (currentRecord.rack) {
      API.getInstancesForRack(currentRecord.rack.id).then(instances =>
        setInstances(instances.filter(i => i.id !== currentRecord.id))
      );
    }
  }, [currentRecord.rack]);

  const rack = {
    height: 42, // fixed for now
    name: currentRecord.rack ? rackToString(currentRecord.rack) : "",
    instances: instances
  };

  return currentRecord.model && currentRecord.rack ? (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules,
        initialValue: initialValue
      })(
        <InstancePositionPicker
          rack={rack}
          model={currentRecord.model}
          hostname={currentRecord.hostname}
          onSelect={(instance, level) => {
            onChange({
              [schemaFrag.fieldName]: level
            });
            form.setFieldsValue({
              [schemaFrag.fieldName]: level
            });
          }}
          onValidation={isValid => {
            !isValid &&
              form.setFieldsValue({
                [schemaFrag.fieldName]: null
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
  ) : props.schemaFrag.type === "rack" ? (
    <RackFormItem {...props} />
  ) : props.schemaFrag.type === "rack_u" ? (
    <RackUFormItem {...props} />
  ) : null;
}

export default FormItem;
