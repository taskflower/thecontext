// src/themes/default/commons/form/fields/boolean.tsx
import React from 'react';
import { BaseFieldProps } from './types';



const boolean: React.FC<BaseFieldProps> = ({
  name,
  formik,
  fieldSchema,
  fieldId,
}) => {
  const { 
    placeholder,
    disabled,
    readonly,
    labelPosition = "right", // Możemy dodać własne ustawienie pozycji etykiety
    checkboxLabel, // Opcjonalna etykieta dla samego checkboxa
    ...otherProps
  } = fieldSchema;
  
  const value = formik.values[name];
  const label = checkboxLabel || placeholder || "";

  return (
    <div className="flex items-center gap-2">
      {labelPosition === "left" && label && (
        <label htmlFor={fieldId} className="text-sm text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
      
      <input
        type="checkbox"
        id={fieldId}
        name={name}
        checked={value || false}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        disabled={disabled}
        readOnly={readonly}
        className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded cursor-pointer"
        {...otherProps.inputProps}
      />
      
      {labelPosition === "right" && label && (
        <label htmlFor={fieldId} className="text-sm text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
};

export default boolean;