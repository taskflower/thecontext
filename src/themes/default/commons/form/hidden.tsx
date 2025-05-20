// src/themes/default/commons/form/hidden.tsx
import React from "react";
import { BaseFieldProps } from "./types";

const hidden: React.FC<BaseFieldProps> = ({
  name,
  formik,
  fieldSchema,
  fieldId,
}) => {
  // Wartość pola będzie przechowywana w formik, ale nie będzie widoczna w UI
  const { disabled, ...otherProps } = fieldSchema;
  const value = formik.values[name];

  return (
    <input
      type="hidden"
      id={fieldId}
      name={name}
      value={value || ""}
      onChange={formik.handleChange}
      // Przekazujemy dodatkowe właściwości komponentu input
      {...otherProps.inputProps}
    />
  );
};

export default hidden;