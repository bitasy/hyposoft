import React from "react";
import StringFormItem from "./StringFormItem";
import NumberFormItem from "./NumberFormItem";
import ColorFormItem from "./ColorFormItem";
import TextAreaFormItem from "./TextAreaFormItem";
import ModelFormItem from "./ModelFormItem";
import RackFormItem from "./RackFormItem";
import RackUFormItem from "./RackUFormItem";
import UserFormItem from "./UserFormItem";
import NetworkPortLabelFormItem from "./NetworkPortLabelFormItem";
import AutogenNumberFormItem from "./AutogenNumberFormItem";
import DatacenterFormItem from "./DatacenterFormItem";

export const FORM_ITEM_LAYOUT = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

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
  ) : props.schemaFrag.type === "network_port_labels" ? (
    <NetworkPortLabelFormItem {...props} />
  ) : props.schemaFrag.type === "autogen-number" ? (
    <AutogenNumberFormItem {...props} />
  ) : props.schemaFrag.type === "datacenter" ? (
    <DatacenterFormItem {...props} />
  ) : null;
}

export default FormItem;
