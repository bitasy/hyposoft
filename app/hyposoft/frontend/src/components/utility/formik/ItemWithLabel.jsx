import React from "react";
import { Field } from "formik";
import styled from "styled-components";

const LabelSpan = styled("span")`
  display: block;
`;

const ErrorSpan = styled("span")`
  display: block;
  color: red;
`;

function ItemWithLabel({ name, label, children }) {
  return (
    <div style={{ textAlign: "left" }}>
      <LabelSpan>{label}</LabelSpan>
      {children}
      <Field name={name}>
        {({ meta: { error, touched } }) => {
          const displayError =
            typeof error === "string" && touched;
          const style = {
            visibility: displayError ? "visible" : "hidden",
          };
          return (
            <ErrorSpan style={style}>
              {displayError ? error : "hidden text"}
            </ErrorSpan>
          );
        }}
      </Field>
    </div>
  );
}

export default ItemWithLabel;
