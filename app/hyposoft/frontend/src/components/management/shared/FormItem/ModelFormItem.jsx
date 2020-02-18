import { FORM_ITEM_LAYOUT } from "./FormItem";
import React from "react";
import { useHistory } from "react-router-dom";
import { Form, Select, Button, Icon, Row, Col } from "antd";
import { modelKeywordMatch } from "../../ModelManagement/ModelSchema";
import { useDispatch, useSelector } from "react-redux";

function ModelFormItem({
  form,
  schemaFrag,
  originalValue,
  onChange,
  disabled
}) {
  const rules = schemaFrag.required
    ? [{ required: true, message: "This field is required" }]
    : [];

  const history = useHistory();
  const dispatch = useDispatch();

  const initialValue = originalValue && originalValue.id;

  const modelList = useSelector(s =>
    Object.values(s.models).sort((m1, m2) =>
      modelToString(m1).localeCompare(modelToString(m2))
    )
  );
  const modelsByID = useSelector(s => s.models);

  React.useEffect(() => {
    dispatch(fetchModels());
  }, []);

  const selectedModelID = form.getFieldValue(schemaFrag.fieldName);

  return (
    <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
      <Row align="middle" type="flex" gutter={8}>
        <Col span={22}>
          {form.getFieldDecorator(schemaFrag.fieldName, {
            rules,
            initialValue: initialValue
          })(
            <Select
              showSearch
              disabled={disabled}
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

export default ModelFormItem;
