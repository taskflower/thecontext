// src/components/ui/status/StatusBadge.tsx
import { Badge } from "@/components/ui/badge";

export type StatusType = 
  | "todo" 
  | "pending" 
  | "in-progress" 
  | "in_progress" 
  | "completed" 
  | "failed" 
  | "review" 
  | "skipped"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  // Map statuses to consistent representations
  const normalizedStatus = normalizeStatus(status);
  
  // Get style based on normalized status
  const { label, style } = getStatusStyles(normalizedStatus);
  
  return (
    <Badge 
      variant={style.variant} 
      className={`${style.className} ${className}`}
    >
      {label}
    </Badge>
  );
}

// Helper to normalize different status formats
export function normalizeStatus(status: StatusType): string {
  switch (status.toLowerCase()) {
    case "todo":
    case "pending":
      return "pending";
    case "in-progress":
    case "in_progress":
      return "in-progress";
    case "completed":
    case "done":
      return "completed";
    case "failed":
      return "failed";
    case "review":
      return "review";
    case "skipped":
      return "skipped";
    default:
      return status.toLowerCase();
  }
}

// Style definitions for each status type
export function getStatusStyles(status: string) {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        style: {
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200"
        }
      };
    case "in-progress":
      return {
        label: "In Progress",
        style: {
          variant: "secondary" as const,
          className: "bg-blue-100 text-blue-800 border-blue-200"
        }
      };
    case "completed":
      return {
        label: "Completed",
        style: {
          variant: "secondary" as const,
          className: "bg-green-100 text-green-800 border-green-200"
        }
      };
    case "failed":
      return {
        label: "Failed",
        style: {
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800"
        }
      };
    case "review":
      return {
        label: "Review",
        style: {
          variant: "secondary" as const,
          className: "bg-purple-100 text-purple-800 border-purple-200"
        }
      };
    case "skipped":
      return {
        label: "Skipped",
        style: {
          variant: "outline" as const,
          className: "bg-amber-50 text-amber-800 border-amber-200"
        }
      };
    default:
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        style: {
          variant: "outline" as const,
          className: ""
        }
      };
  }
}