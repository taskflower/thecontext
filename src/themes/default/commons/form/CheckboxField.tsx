// src/themes/default/commons/form/fields/CheckboxField.tsx
import React from 'react';
import { BaseFieldProps } from '.';


const CheckboxField: React.FC<BaseFieldProps> = ({
  name,
  formik,
  fieldSchema,
  fieldId,
}) => {
  const { placeholder } = fieldSchema;
  const value = formik.values[name];

  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={fieldId}
        name={name}
        checked={value || false}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
      />
      <label htmlFor={fieldId} className="ml-2 text-sm text-gray-700">
        {placeholder || "Zaznacz"}
      </label>
    </div>
  );
};

export default CheckboxField;