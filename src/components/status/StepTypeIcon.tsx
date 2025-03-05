// src/components/ui/status/StepTypeIcon.tsx
import { FileText, CheckSquare, ClipboardCheck, FormInput, MessageSquare } from "lucide-react";

export type StepType = 
  | "form" 
  | "document" 
  | "checklist" 
  | "decision" 
  | "ai-content"
  | string;

interface StepTypeIconProps {
  type: StepType;
  size?: number;
  className?: string;
}

export function StepTypeIcon({ 
  type, 
  size = 16, 
  className = "" 
}: StepTypeIconProps) {
  const { Icon, color } = getStepTypeInfo(type);
  
  return <Icon className={`${color} ${className}`} size={size} />;
}

function getStepTypeInfo(type: StepType) {
  switch (type) {
    case "form":
      return {
        Icon: FormInput,
        color: "text-purple-500",
        label: "Form"
      };
    case "document":
      return {
        Icon: FileText,
        color: "text-blue-500",
        label: "Document"
      };
    case "checklist":
      return {
        Icon: ClipboardCheck,
        color: "text-amber-500",
        label: "Checklist"
      };
    case "decision":
      return {
        Icon: CheckSquare,
        color: "text-green-500",
        label: "Decision"
      };
    case "ai-content":
      return {
        Icon: MessageSquare,
        color: "text-indigo-500",
        label: "AI Content"
      };
    default:
      return {
        Icon: FileText,
        color: "text-gray-500",
        label: type
      };
  }
}

export function getStepTypeBadgeInfo(type: StepType) {
  const info = getStepTypeInfo(type);
  return {
    Icon: info.Icon,
    color: info.color,
    label: info.label
  };
}