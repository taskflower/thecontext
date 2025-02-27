// src/pages/tasks/TaskFlow/task-steps/components/StepTypeIcon.tsx
import React from "react";
import { 
  FormInput, 
  FileText, 
  FileSearch, 
  Braces, 
  Globe 
} from "lucide-react";
import { StepType } from "../types";

interface StepTypeIconProps {
  type: StepType;
  size?: number;
  className?: string;
}

const StepTypeIcon: React.FC<StepTypeIconProps> = ({ 
  type, 
  size = 16, 
  className = "" 
}) => {
  switch (type) {
    case 'form':
      return <FormInput size={size} className={className} />;
    case 'createDocument':
      return <FileText size={size} className={className} />;
    case 'getDocument':
      return <FileSearch size={size} className={className} />;
    case 'llmProcess':
      return <Braces size={size} className={className} />;
    case 'apiProcess':
      return <Globe size={size} className={className} />;
    default:
      return null;
  }
};

export default StepTypeIcon;