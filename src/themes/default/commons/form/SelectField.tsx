// src/themes/default/commons/form/SelectField.tsx
import React from "react";
import { FieldProps } from "./fieldTypes";


const SelectField: React.FC<FieldProps> = ({
  fieldName,
  fieldSchema,
  fieldValue,
  fieldError,
  handleChange,
  nodeSlug,
}) => {
  const { title, required, description, options } = fieldSchema;

  return (
    <div className="my-4 space-y-2">
      <label className="text-sm font-semibold text-gray-900">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <select
        value={fieldValue || ""}
        onChange={(e) => {
          console.log(`[FormField:${nodeSlug}] Select change:`, fieldName, e.target.value);
          handleChange(fieldName, e.target.value);
        }}
        className="w-full border rounded border-gray-200 px-3 py-2 text-sm hover:border-gray-300 focus:outline-none"
      >
        <option value="">-- Wybierz --</option>
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
    </div>
  );
};

export default SelectField;