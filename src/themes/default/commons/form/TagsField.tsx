// src/themes/default/commons/form/fields/TagsField.tsx
import React from 'react';
import { BaseFieldProps } from '.';


const TagsField: React.FC<BaseFieldProps> = ({
  name,
  formik,
  fieldSchema,
  fieldId,
}) => {
  const { options } = fieldSchema;
  const value = formik.values[name];

  const handleChange = (newValue: any) => {
    formik.setFieldValue(name, newValue);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {Array.isArray(value) && value.map((tag) => (
          <span 
            key={tag} 
            className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-full flex items-center"
          >
            {tag}
            <button
              type="button"
              className="ml-1 text-gray-500 hover:text-gray-700"
              onClick={() => {
                const newTags = (value || []).filter((t: string) => t !== tag);
                handleChange(newTags);
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex">
        <select
          id={fieldId}
          value=""
          onChange={(e) => {
            if (e.target.value) {
              const currentTags = Array.isArray(value) ? value : [];
              if (!currentTags.includes(e.target.value)) {
                handleChange([...currentTags, e.target.value]);
              }
              e.target.value = "";
            }
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
      </div>
    </div>
  );
};

export default TagsField;