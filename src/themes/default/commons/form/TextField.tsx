// src/themes/default/commons/form/fields/TextField.tsx (przykład)
import React from "react";
import { BaseFieldProps } from "./types";


const TextField: React.FC<BaseFieldProps> = ({
  name,
  formik,
  fieldSchema,
  fieldId,
}) => {
  // Możemy teraz bezpośrednio korzystać z właściwości schemy bez żadnego mapowania
  const { 
    placeholder, 
    type = "text", 
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

  // Określ typ pola na podstawie typu w schemacie lub podstawowy text
  const inputType = type === "string" ? "text" : type;

  return (
    <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
      <input
        type={inputType}
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
        // Możemy również przekazać dodatkowe właściwości
        {...otherProps.inputProps}
      />
    </div>
  );
};

export default TextField;