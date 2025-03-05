// src/components/ui/status/PriorityBadge.tsx
import { Badge } from "@/components/ui/badge";

export type PriorityType = "low" | "medium" | "high" | string;

interface PriorityBadgeProps {
  priority: PriorityType;
  className?: string;
  showLabel?: boolean;
}

export function PriorityBadge({ 
  priority, 
  className = "",
  showLabel = true 
}: PriorityBadgeProps) {
  const normalizedPriority = normalizePriority(priority);
  const { label, style } = getPriorityStyles(normalizedPriority, showLabel);
  
  return (
    <Badge 
      variant={style.variant} 
      className={`${style.className} ${className}`}
    >
      {label}
    </Badge>
  );
}

// Helper to normalize priority
export function normalizePriority(priority: PriorityType): string {
  switch (priority.toLowerCase()) {
    case "low":
      return "low";
    case "medium":
    case "med":
    case "normal":
      return "medium";
    case "high":
    case "urgent":
      return "high";
    default:
      return priority.toLowerCase();
  }
}

// Style definitions for each priority level
function getPriorityStyles(priority: string, showLabel: boolean) {
  switch (priority) {
    case "low":
      return {
        label: showLabel ? "Low Priority" : "Low",
        style: {
          variant: "outline" as const,
          className: "bg-blue-50 text-blue-700 border-blue-200"
        }
      };
    case "medium":
      return {
        label: showLabel ? "Medium Priority" : "Medium",
        style: {
          variant: "secondary" as const,
          className: "bg-purple-50 text-purple-700 border-purple-200"
        }
      };
    case "high":
      return {
        label: showLabel ? "High Priority" : "High",
        style: {
          variant: "default" as const,
          className: "bg-red-50 text-red-700 border-red-200"
        }
      };
    default:
      return {
        label: priority.charAt(0).toUpperCase() + priority.slice(1),
        style: {
          variant: "outline" as const,
          className: ""
        }
      };
  }
}