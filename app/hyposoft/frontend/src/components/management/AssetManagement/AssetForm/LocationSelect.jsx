import React from "react";
import { useField } from "formik";
import { DisableContext } from "../../../../contexts/contexts";
import { Radio } from "antd";

function LocationSelect({ name, onChange, ...restProps }) {
  const { disabled } = React.useContext(DisableContext);
  const [{ value }, {}, { setValue, setTouched }] = useField(name);

  function innerOnChange(e) {
    setTouched(true);
    setValue(e.target.value);
    onChange && onChange(e);
  }

  return (
    <Radio.Group
      onChange={innerOnChange}
      value={value}
      disabled={disabled}
      {...restProps}
    >
      <Radio value="rack-mount">Rack Mount</Radio>
      <Radio value="chassis-mount">Chassis Mount</Radio>
      <Radio value="offline">Offline</Radio>
    </Radio.Group>
  );
}

export default LocationSelect;
