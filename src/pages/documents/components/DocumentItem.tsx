// src/pages/documents/components/DocumentItem.tsx

import React from "react";
import { Folder, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDataStore } from "@/store";

interface DocumentItemProps {
  type: 'document' | 'folder';
  id: string;
  name: string;
  metaKeys?: string[];
  updatedAt?: string;
  onNavigate?: (e: React.MouseEvent) => void;
  onSelect?: (e: React.MouseEvent) => void;
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
  const { folders } = useDataStore();
  const Icon = type === "folder" ? Folder : FileText;
  
  // Find the folder to check if it's a project folder
  const folder = type === "folder" ? folders.find(f => f.id === id) : null;
  const isProjectFolder = folder?.isProjectFolder;
  const isProjectRoot = folder?.isProjectRoot;
  
  // Get the appropriate color based on folder type
  const getFolderColor = () => {
    if (isProjectRoot) return "text-purple-500";
    if (isProjectFolder) return "text-green-500";
    return "text-primary";
  };
  
  // Format date if available
  const formattedDate = updatedAt ? new Date(updatedAt).toLocaleDateString() : '';
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (type === "folder" && onNavigate) {
      onNavigate(e);
    } else if (type === "document" && onSelect) {
      onSelect(e);
    }
  };
  
  return (
    <div
      className="flex items-center p-3 rounded-md hover:bg-secondary cursor-pointer"
      onClick={handleClick}
    >
      <Icon
        size={16}
        className={`mr-2 ${
          type === "folder" ? getFolderColor() : "text-muted-foreground"
        }`}
      />
      <div className="flex-1">
        <div className={type === "folder" ? "font-medium" : ""}>{name}</div>
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