// src/themes/default/commons/form/fields/text.tsx
import React from "react";
import { BaseFieldProps } from "./types";


const text: React.FC<BaseFieldProps> = ({
  name,
  formik,
  fieldSchema,
  fieldId,
}) => {
  const { 
    placeholder, 
    disabled, 
    readonly, 
    pattern, 
    autofocus,
    autocomplete,
    min,
    max,
    step,
    // Możemy używać dowolnych właściwości przekazanych w schemacie
    ...otherProps
  } = fieldSchema;
  
  const value = formik.values[name];

  return (
    <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
      <input
        type="text"
        id={fieldId}
        name={name}
        value={value || ""}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        className="w-full bg-transparent text-sm focus:outline-none"
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        autoFocus={autofocus}
        pattern={pattern}
        autoComplete={autocomplete}
        min={min}
        max={max}
        step={step}
        // Przekazujemy dodatkowe właściwości komponentu input
        {...otherProps.inputProps}
      />
    </div>
  );
};

export default text;