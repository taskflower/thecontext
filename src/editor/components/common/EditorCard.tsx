// src/editor/components/common/EditorCard.tsx
import React, { ReactNode } from "react";

interface EditorCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const EditorCard: React.FC<EditorCardProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-800">{title}</h2>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {children}
    </div>
  );
};
