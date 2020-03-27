import React from "react";
import { useField } from "formik";
import { ChromePicker } from "react-color";
import { DisableContext } from "../../../../contexts/contexts";

function ColorPicker({ name, ...restProps }) {
  const { disabled } = React.useContext(DisableContext);
  const [{ value }, {}, { setValue }] = useField(name);

  return (
    <ChromePicker
      disableAlpha
      color={value}
      onChange={color => {
        if (disabled) return;
        setValue(color.hex);
      }}
      {...restProps}
    />
  );
}

export default ColorPicker;
