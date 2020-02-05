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
import InstancePositionPicker from "./InstancePositionPicker";
import { rackToString } from "../InstanceManagement/InstanceSchema";
import { modelKeywordMatch } from "../ModelManagement/ModelSchema";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchModels,
  fetchRacks,
  fetchInstances,
  fetchUsers
} from "../../../redux/actions";

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

function StringFormItem({ form, schemaFrag, originalValue, onChange }) {
  const initialValue = originalValue || schemaFrag.defaultValue;

  const extractDS = schemaFrag.extractDataSource;
  const dataSource = useSelector(s => (extractDS != null ? extractDS(s) : []));

  React.useEffect(() => {
    onChange({ [schemaFrag.fieldName]: initialValue });
  }, []);

  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  return (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules,
        initialValue: initialValue.toString()
      })(
        <AutoComplete
          placeholder={schemaFrag.displayName}
          dataSource={dataSource}
          filterOption={(input, option) => option.key.includes(input)}
          onChange={v => {
            onChange({ [schemaFrag.fieldName]: v });
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

  const dispatch = useDispatch();
  const rackList = useSelector(s => Object.values(s.racks));

  React.useEffect(() => {
    dispatch(fetchRacks());
  }, []);

  return (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules,
        initialValue: originalValue && originalValue.id
      })(
        <Select
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

function ModelFormItem({ form, schemaFrag, originalValue, onChange }) {
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  const history = useHistory();
  const dispatch = useDispatch();

  const initialValue = originalValue && originalValue.id;

  const modelList = useSelector(s => Object.values(s.models));
  const modelsByID = useSelector(s => s.models);

  React.useEffect(() => {
    dispatch(fetchModels());
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

  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(fetchInstances());
  }, []);

  const instances = useSelector(s => Object.values(s.instances));

  const filteredInstances = currentRecord.rack
    ? instances.filter(
        i => i.rack.id === currentRecord.rack.id && i.id != currentRecord.id
      )
    : [];

  const rack = {
    height: 42, // fixed for now
    name: currentRecord.rack ? rackToString(currentRecord.rack) : "",
    instances: filteredInstances
  };

  return currentRecord.model && currentRecord.rack ? (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        rules,
        initialValue: initialValue
      })(
        <InstancePositionPicker
          key={currentRecord.rack.id}
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
            if (!isValid) {
              form.setFieldsValue({
                [schemaFrag.fieldName]: null
              });
            }
          }}
        />
      )}
    </Form.Item>
  ) : null;
}

function UserFormItem({ form, schemaFrag, originalValue, onChange }) {
  const dispatch = useDispatch();

  const initialValue = originalValue && originalValue.id;

  const userList = useSelector(s => Object.values(s.users));
  const usersByID = useSelector(s => s.users);

  React.useEffect(() => {
    dispatch(fetchUsers());
  }, []);

  return (
    <Form.Item label={schemaFrag.displayName} {...formItemLayout}>
      {form.getFieldDecorator(schemaFrag.fieldName, {
        initialValue: initialValue
      })(
        <Select
          allowClear
          showSearch
          onChange={v => {
            if (v === undefined) v = null;
            onChange({ [schemaFrag.fieldName]: v && usersByID[v] });
          }}
          filterOption={(input, option) => {
            return modelKeywordMatch(input, usersByID[option.props.value]);
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
  ) : props.schemaFrag.type === "rack_position" ? (
    <RackUFormItem {...props} />
  ) : props.schemaFrag.type === "user" ? (
    <UserFormItem {...props} />
  ) : null;
}

export default FormItem;
