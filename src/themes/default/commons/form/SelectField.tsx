// src/themes/default/commons/form/fields/SelectField.tsx
import React from 'react';
import { BaseFieldProps } from '.';


const SelectField: React.FC<BaseFieldProps> = ({
  name,
  formik,
  fieldSchema,
  fieldId,
}) => {
  const { options } = fieldSchema;
  const value = formik.values[name];

  return (
    <select
      id={fieldId}
      name={name}
      value={value || ""}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      className="w-full border rounded border-gray-200 px-3 py-2 text-sm hover:border-gray-300 focus:outline-none"
    >
      <option value="">-- Wybierz --</option>
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default SelectField;
