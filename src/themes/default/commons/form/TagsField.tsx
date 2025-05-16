// src/themes/default/commons/form/TagsField.tsx
import React, { useState } from "react";
import { FieldProps } from "./fieldTypes";


const TagsField: React.FC<FieldProps> = ({
  fieldName,
  fieldSchema,
  fieldValue,
  fieldError,
  handleChange,
  nodeSlug,
}) => {
  const { title, required, description, options } = fieldSchema;
  const [newTag, setNewTag] = useState("");

  // Funkcja obsługująca dodawanie tagów
  const handleAddTag = (tag: string) => {
    if (!tag.trim()) return;
    
    // Upewnij się, że fieldValue jest tablicą
    const currentTags = Array.isArray(fieldValue) ? fieldValue : [];
    
    // Dodaj tag tylko jeśli nie istnieje już w tablicy
    if (!currentTags.includes(tag)) {
      const updatedTags = [...currentTags, tag];
      handleChange(fieldName, updatedTags);
    }
    
    setNewTag("");
  };

  // Funkcja obsługująca usuwanie tagów
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = Array.isArray(fieldValue) ? fieldValue : [];
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    handleChange(fieldName, updatedTags);
  };

  return (
    <div className="my-4 space-y-2">
      <label className="text-sm font-semibold text-gray-900">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      
      <div className="flex flex-wrap gap-2 mb-2">
        {Array.isArray(fieldValue) && fieldValue.map((tag) => (
          <span 
            key={tag} 
            className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-full flex items-center"
          >
            {tag}
            <button
              type="button"
              className="ml-1 text-gray-500 hover:text-gray-700"
              onClick={() => handleRemoveTag(tag)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <div className="flex">
        <select
          value={newTag}
          onChange={(e) => {
            if (e.target.value) {
              handleAddTag(e.target.value);
              e.target.value = ""; // Reset select po dodaniu
            }
          }}
          className="w-full border rounded-l border-gray-200 px-3 py-2 text-sm hover:border-gray-300 focus:outline-none"
        >
          <option value="">-- Wybierz usługę --</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      
      {fieldError && <p className="text-red-500 text-xs">{fieldError}</p>}
    </div>
  );
};

export default TagsField;
