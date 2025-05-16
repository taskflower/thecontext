// src/themes/default/commons/form/NumberField.tsx
import React from "react";
import { FieldProps } from "./fieldTypes";


const NumberField: React.FC<FieldProps> = ({
  fieldName,
  fieldSchema,
  fieldValue,
  fieldError,
  handleChange,
  nodeSlug,
}) => {
  const { title, required, description, placeholder, min, max, step } = fieldSchema;

  return (
    <div className="my-4 space-y-2">
      <label className="text-sm font-semibold text-gray-900">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
        <input
          type="number"
          value={fieldValue === undefined ? "" : fieldValue}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const val = e.target.value === "" ? "" : Number(e.target.value);
            console.log(`[FormField:${nodeSlug}] Number input change:`, fieldName, val);
            handleChange(fieldName, val);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>
      {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
    </div>
  );
};

export default NumberField;