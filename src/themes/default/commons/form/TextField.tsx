// src/themes/default/commons/form/TextField.tsx
import React from "react";
import { FieldProps } from "./fieldTypes";


const TextField: React.FC<FieldProps> = ({
  fieldName,
  fieldSchema,
  fieldValue,
  fieldError,
  handleChange,
  nodeSlug,
}) => {
  const { title, required, description, placeholder, fieldType = "text" } = fieldSchema;

  return (
    <div className="my-4 space-y-2">
      <label className="text-sm font-semibold text-gray-900">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <div className="relative w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus-within:border-gray-400">
        <input
          type={fieldType}
          value={fieldValue || ""}
          onChange={(e) => {
            console.log(`[FormField:${nodeSlug}] Input change:`, fieldName, e.target.value);
            handleChange(fieldName, e.target.value);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </div>
      {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
    </div>
  );
};

export default TextField;