import React from "react";
import { Field } from "formik";
import { Input as $Input } from "antd";
import { DisableContext } from "../../../contexts/Contexts";

function Input({ name, validate, ...props }) {
  const { disabled } = React.useContext(DisableContext);

  return (
    <Field name={name} validate={validate}>
      {({ field: { value }, form: { setFieldValue, setFieldTouched } }) => {
        return (
          <$Input
            {...props}
            value={value}
            disabled={disabled}
            onChange={e => {
              const value = e.target.value;
              setFieldValue(name, value);
              setFieldTouched(name, true, false);
            }}
          />
        );
      }}
    </Field>
  );
}

export default Input;
