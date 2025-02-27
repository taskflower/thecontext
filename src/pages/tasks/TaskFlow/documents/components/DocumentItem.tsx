// src/pages/tasks/TaskFlow/documents/components/DocumentItem.tsx

import React from "react";
import { Folder, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentItemProps {
  type: 'document' | 'folder';
  id: string;
  name: string;
  metaKeys?: string[];
  updatedAt?: string;
  onNavigate?: () => void;
  onSelect?: () => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ 
  type, 
  id, 
  name, 
  metaKeys = [], 
  updatedAt,
  onNavigate, 
  onSelect 
}) => {
  const Icon = type === "folder" ? Folder : FileText;
  
  // Format date if available
  const formattedDate = updatedAt ? new Date(updatedAt).toLocaleDateString() : '';
  
  const handleClick = () => {
    if (type === "folder" && onNavigate) {
      onNavigate();
    } else if (type === "document" && onSelect) {
      onSelect();
    }
  };
  
  return (
    <div
      className={`flex items-center p-3 rounded-md hover:bg-secondary cursor-pointer`}
      onClick={handleClick}
    >
      <Icon
        size={16}
        className={`mr-2 ${
          type === "folder" ? "text-primary" : "text-muted-foreground"
        }`}
      />
      <div className="flex-1">
        <div className={type === "folder" ? "font-medium" : ""}>{name}:{id}</div>
        {type === "document" && metaKeys.length > 0 && (
          <div className="flex gap-1 mt-1">
            {metaKeys.slice(0, 3).map((key, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {key}
              </Badge>
            ))}
            {metaKeys.length > 3 && (
              <span className="text-xs text-muted-foreground">+{metaKeys.length - 3}</span>
            )}
          </div>
        )}
      </div>
      {type === "document" && formattedDate && (
        <div className="text-xs text-muted-foreground ml-2">{formattedDate}</div>
      )}
    </div>
  );
};

export default DocumentItem;