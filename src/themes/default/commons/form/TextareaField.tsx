// src/themes/default/commons/form/fields/TextareaField.tsx
import React from 'react';
import { BaseFieldProps } from '.';


const TextareaField: React.FC<BaseFieldProps> = ({
  name,
  formik,
  fieldSchema,
  fieldId,
}) => {
  const { placeholder } = fieldSchema;
  const value = formik.values[name];

  return (
    <textarea
      id={fieldId}
      name={name}
      value={value || ""}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      rows={4}
      className="w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus:outline-none text-sm"
      placeholder={placeholder}
    />
  );
};

export default TextareaField;