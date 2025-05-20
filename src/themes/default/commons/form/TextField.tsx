// src/themes/default/commons/form/fields/TextField.tsx
import React from "react";
import { BaseFieldProps } from ".";

const TextField: React.FC<BaseFieldProps> = ({
  name,
  formik,
  fieldSchema,
  fieldId,
}) => {
  const { placeholder, fieldType } = fieldSchema;
  const value = formik.values[name];

  return (
    <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
      <input
        type={
          fieldType === "email"
            ? "email"
            : fieldType === "date"
            ? "date"
            : "text"
        }
        id={fieldId}
        name={name}
        value={value || ""}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className="w-full bg-transparent text-sm focus:outline-none"
        placeholder={placeholder}
      />
    </div>
  );
};

export default TextField;
