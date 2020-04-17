import React from "react";
import { useField } from "formik";
import { ChromePicker } from "react-color";
import { DisableContext } from "../../../../contexts/contexts";
import { Checkbox } from "antd";

function ColorPicker({ name, nullable, ...restProps }) {
  const { disabled } = React.useContext(DisableContext);
  const [{ value }, {}, { setValue }] = useField(name);

  function handleChange(e) {
    if (e.target.checked) {
      setValue(null);
    } else {
      setValue("#0ff");
    }
  }

  return (
    <div>
      {nullable && (
        <div>
          Null?: <Checkbox checked={value === null} onChange={handleChange} />
        </div>
      )}
      {value != null && (
        <ChromePicker
          disableAlpha
          color={value}
          onChange={color => {
            if (disabled) return;
            setValue(color.hex);
          }}
          {...restProps}
        />
      )}
    </div>
  );
}

export default ColorPicker;
