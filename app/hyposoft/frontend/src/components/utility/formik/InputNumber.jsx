import React from "react";
import { Field } from "formik";
import { InputNumber as $InputNumber } from "antd";
import { DisableContext } from "../../../contexts/Contexts";

function InputNumber({ name, validate, ...props }) {
  const { disabled } = React.useContext(DisableContext);

  return (
    <Field name={name} validate={validate}>
      {({ field: { value }, form: { setFieldValue, setFieldTouched } }) => {
        return (
          <$InputNumber
            {...props}
            disabled={disabled}
            value={value}
            onChange={value => {
              setFieldValue(name, value);
              setFieldTouched(name, true, false);
            }}
          />
        );
      }}
    </Field>
  );
}

export default InputNumber;
