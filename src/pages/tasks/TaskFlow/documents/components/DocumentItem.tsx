import React from "react";
import { Folder, FileText } from "lucide-react";

interface DocumentItemProps {
  type: 'file' | 'folder';
  id: string;
  name: string;
  onNavigate?: () => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ type, id, name, onNavigate }) => {
  const Icon = type === "folder" ? Folder : FileText;
  
  return (
    <div
      className={`flex items-center p-3 rounded-md hover:bg-secondary ${
        type === "folder" ? "cursor-pointer" : ""
      }`}
      onClick={type === "folder" ? onNavigate : undefined}
    >
      <Icon
        size={16}
        className={`mr-2 ${
          type === "folder" ? "text-primary" : "text-muted-foreground"
        }`}
      />
      <span className={type === "folder" ? "font-medium" : ""}>{name}</span>
    </div>
  );
};

export default DocumentItem;