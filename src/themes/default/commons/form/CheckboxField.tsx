import React from "react";
import { FieldProps } from "./fieldTypes";

const CheckboxField: React.FC<FieldProps> = ({
  fieldName,
  fieldSchema,
  fieldValue,
  fieldError,
  handleChange,
  nodeSlug,
}) => {
  const { title, required, description, placeholder } = fieldSchema;
  // Generate a unique ID for the checkbox using the nodeSlug and fieldName
  const checkboxId = `checkbox-${nodeSlug}-${fieldName}`;

  return (
    <div className="my-4 space-y-2">
      <label
        htmlFor={checkboxId}
        className="text-sm font-semibold text-gray-900"
      >
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <div className="flex items-center">
        <input
          id={checkboxId}
          type="checkbox"
          checked={fieldValue || false}
          onChange={(e) => {
            console.log(
              `[FormField:${nodeSlug}] Checkbox change:`,
              fieldName,
              e.target.checked
            );
            handleChange(fieldName, e.target.checked);
          }}
          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
        />
        <label htmlFor={checkboxId} className="ml-2 text-sm text-gray-700">
          {placeholder || "Zaznacz"}
        </label>
      </div>
      {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
    </div>
  );
};

export default CheckboxField;
