// src/editor/components/common/EditorTabs.tsx
import React from "react";

interface TabOption {
  id: string;
  label: string;
}

interface EditorTabsProps {
  activeTab: string;
  options: TabOption[];
  onChange: (tab: string) => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  activeTab,
  options,
  onChange,
}) => {
  return (
    <div className="border p-px rounded-md border-white shadow mb-8">
      <div className="flex space-x-px">
        {options.map((option) => (
          <button
            key={option.id}
            className={`px-3 py-2 text-sm rounded-md ${
              activeTab === option.id
                ? "bg-blue-100 text-blue-800"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
