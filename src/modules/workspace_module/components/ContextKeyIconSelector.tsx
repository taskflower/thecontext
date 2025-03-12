// src/modules/workspaces_module/components/ContextKeyIconSelector.tsx

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { availableIcons } from './contextIconService';
import React from "react";

interface ContextKeyIconSelectorProps {
  selectedIcon: string;
  onSelectIcon: (iconKey: string) => void;
}

const ContextKeyIconSelector: React.FC<ContextKeyIconSelectorProps> = ({ 
  selectedIcon, 
  onSelectIcon 
}) => {
  return (
    <Select value={selectedIcon} onValueChange={onSelectIcon}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an icon">
          <div className="flex items-center gap-2">
            {React.createElement(availableIcons[selectedIcon] || availableIcons.box, { className: "h-4 w-4" })}
            <span className="capitalize">{selectedIcon}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(availableIcons).map(([key, Icon]) => (
          <SelectItem key={key} value={key}>
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span className="capitalize">{key}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ContextKeyIconSelector;