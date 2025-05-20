// src/themes/default/commons/form/fields/NumberField.tsx
import React from 'react';
import { BaseFieldProps } from '.';


const NumberField: React.FC<BaseFieldProps> = ({
  name,
  formik,
  fieldSchema,
  fieldId,
}) => {
  const { placeholder, min, max, step } = fieldSchema;
  const value = formik.values[name];

  return (
    <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
      <input
        type="number"
        id={fieldId}
        name={name}
        value={value === undefined ? "" : value}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className="w-full bg-transparent text-sm focus:outline-none"
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
};

export default NumberField;