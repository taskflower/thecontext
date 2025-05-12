// src/themes/default/components/widgets/TagsInputWidget.tsx
import React, { useState } from 'react';

interface TagsInputWidgetProps {
  contextDataPath?: string;
  title?: string;
  options: { value: string, label: string }[];
  colSpan?: number | "full";
  onDataChange?: (path: string, value: any) => void;
  data?: any;
}

const TagsInputWidget: React.FC<TagsInputWidgetProps> = ({
  contextDataPath = '',
  title = 'Tagi',
  options = [],
  colSpan = 1,
  onDataChange,
  data = [],
}) => {
  const tags = Array.isArray(data) ? data : [];

  const handleAddTag = (tag: string) => {
    if (!tag) return;
    if (!tags.includes(tag)) {
      const newTags = [...tags, tag];
      onDataChange?.(contextDataPath, newTags);
    }
  };

  const handleRemoveTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    onDataChange?.(contextDataPath, newTags);
  };

  return (
    <div className={`col-span-${colSpan === 'full' ? 'full' : colSpan}`}>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map(tag => (
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
      
      <select
        value=""
        onChange={(e) => {
          handleAddTag(e.target.value);
          e.target.value = "";
        }}
        className="w-full border rounded border-gray-200 px-3 py-2 text-sm hover:border-gray-300 focus:outline-none"
      >
        <option value="">-- Wybierz usługę --</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TagsInputWidget;