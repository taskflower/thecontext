// src/components/ui/status/ConnectionTypeBadge.tsx
import { Badge } from "@/components/ui/badge";

export type ConnectionType = "dependency" | "parent" | "child" | "related" | string;

interface ConnectionTypeBadgeProps {
  type?: ConnectionType;
  className?: string;
}

export function ConnectionTypeBadge({ 
  type = "related", 
  className = "" 
}: ConnectionTypeBadgeProps) {
  const { label, style } = getConnectionTypeStyles(type);
  
  return (
    <Badge 
      className={`${style.className} ${className}`}
    >
      {label}
    </Badge>
  );
}

// Style definitions for each connection type
function getConnectionTypeStyles(type: ConnectionType) {
  switch (type) {
    case "dependency":
      return {
        label: "Depends On",
        style: {
          className: "bg-amber-100 text-amber-800 border-amber-300"
        }
      };
    case "parent":
      return {
        label: "Parent",
        style: {
          className: "bg-blue-100 text-blue-800 border-blue-300"
        }
      };
    case "child":
      return {
        label: "Child",
        style: {
          className: "bg-green-100 text-green-800 border-green-300"
        }
      };
    case "related":
    default:
      return {
        label: "Related",
        style: {
          className: "bg-indigo-100 text-indigo-800 border-indigo-300"
        }
      };
  }
}