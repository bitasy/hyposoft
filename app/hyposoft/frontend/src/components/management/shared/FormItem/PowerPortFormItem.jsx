// import React from "react";
// import { Form, InputNumber, Checkbox, Row } from "antd";
// import { FORM_ITEM_LAYOUT } from "./FormItem";

// function PowerPortFormItem({
//   form,
//   schemaFrag,
//   originalValue,
//   currentRecord,
//   onChange,
//   disabled
// }) {
//   const initialValue = originalValue || schemaFrag.defaultValue;

//   React.useEffect(() => {
//     onChange({ [schemaFrag.fieldName]: initialValue });
//   }, []);

//   const rules = schemaFrag.required
//     ? [{ required: true, message: "This field is required" }]
//     : [];

//   return (
//     <Form.Item label={schemaFrag.displayName} {...FORM_ITEM_LAYOUT}>
//       {form.getFieldDecorator(schemaFrag.fieldName, { rules, initialValue })(
//         <Input
//           disabled={disabled}
//           currentRecord={currentRecord}
//           onChange={v => onChange({ [schemaFrag.fieldName]: v })}
//           style={{ width: "100%" }}
//         />
//       )}
//     </Form.Item>
//   );
// }

// const Input = React.forwardRef(
//   ({ value, onChange, disabled, currentRecord }, ref) => {
//     const powereds = currentRecord.powereds;
//     const numPowerPorts = currentRecord.model.power_ports || 0

//     return (
//       <div ref={ref}>
//         <div>
//           {(new Array(numPowerPorts)).map((z, idx) => (
//             <>

//             </>
//           ))}
//         </div>
//       </div>
//     );
//   }
// );

// const PowerPortSelection({ })

// export default PowerPortFormItem;
