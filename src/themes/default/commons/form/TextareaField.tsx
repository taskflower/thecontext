// src/themes/default/components/commons/form/TextareaField.tsx
import React from "react";
import { FieldProps } from "./fieldTypes";


const TextareaField: React.FC<FieldProps> = ({
  fieldName,
  fieldSchema,
  fieldValue,
  fieldError,
  handleChange,
  nodeSlug,
}) => {
  const { title, required, description, placeholder } = fieldSchema;

  return (
    <div className="my-4 space-y-2">
      <label className="text-sm font-semibold text-gray-900">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <textarea
        value={fieldValue || ""}
        onChange={(e) => {
          console.log(`[FormField:${nodeSlug}] Textarea change:`, fieldName, e.target.value);
          handleChange(fieldName, e.target.value);
        }}
        placeholder={placeholder}
        rows={4}
        className="w-full border rounded border-gray-200 px-3 py-2 hover:border-gray-300 focus:outline-none text-sm"
      />
      {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
    </div>
  );
};

export default TextareaField;