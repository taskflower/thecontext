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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 p-4 bg-zinc-50/50">
        <h2 className="text-xs font-medium text-gray-800">{description}</h2>
        {description && <p className="text-xl font-semibold text-gray-600">{title}</p>}
      </div>
     <div className="p-10 space-y-4">{children}</div> 
    </div>
  );
};
