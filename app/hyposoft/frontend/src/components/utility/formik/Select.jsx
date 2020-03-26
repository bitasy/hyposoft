import React from "react";
import { Select as $Select } from "antd";
import { Field, useField } from "formik";
import { DisableContext } from "../../../contexts/Contexts";

// name: string
// options: { value: T, text: string }[]
// encode?: (value: T) => string
// decode?: (encoded: string) => T
// onChange?: ()
function Select({
  name,
  options,
  encode,
  decode,
  onChange,
  ...props
}) {
  const { disabled } = React.useContext(DisableContext);
  const [
    { value },
    {},
    { setValue, setTouched },
  ] = useField(name);

  function enc(value) {
    return value && encode ? encode(value) : value;
  }

  function dec(value) {
    return value && decode ? decode(value) : value;
  }

  const multiple = props.mode === "multiple";

  return (
    <$Select
      {...props}
      disabled={disabled}
      value={multiple ? value.map(enc) : enc(value)}
      onChange={s => {
        setTouched();
        if (multiple) {
          setValue(s.map(dec));
          onChange && onChange(s.map(dec));
        } else {
          setValue(dec(s));
          onChange && onChange(dec(s));
        }
      }}
    >
      {options.map(({ value, text }, idx) => (
        <$Select.Option key={idx} value={enc(value)}>
          {text}
        </$Select.Option>
      ))}
    </$Select>
  );
}

export default Select;
