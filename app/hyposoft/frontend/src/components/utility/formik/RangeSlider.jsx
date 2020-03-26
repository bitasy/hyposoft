import React from "react";
import { Field } from "formik";
import { Slider } from "antd";
import { DisableContext } from "../../../contexts/Contexts";

function RangeSlider({ name, validate, ...props }) {
  const { disabled } = React.useContext(DisableContext);

  return (
    <Field name={name} validate={validate}>
      {({
        field: { value },
        form: { setFieldValue, setFieldTouched },
        meta: { initialValue }
      }) => {
        const [min, max] = initialValue;
        return (
          <Slider
            {...props}
            range
            min={min}
            max={max}
            disabled={disabled}
            marks={{ [min]: min, [max]: max }}
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

export default RangeSlider;
