// src/components/ui/status/StatusIcon.tsx
import { Clock, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { normalizeStatus } from "./StatusBadge";

interface StatusIconProps {
  status: string;
  size?: number;
  className?: string;
}

export function StatusIcon({ 
  status, 
  size = 16, 
  className = "" 
}: StatusIconProps) {
  const normalizedStatus = normalizeStatus(status);
  const { Icon, color } = getStatusIcon(normalizedStatus);
  
  return <Icon className={`${color} ${className}`} size={size} />;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
    case "todo":
      return {
        Icon: Clock,
        color: "text-muted-foreground"
      };
    case "in-progress":
      return {
        Icon: ArrowRight,
        color: "text-blue-500"
      };
    case "completed":
      return {
        Icon: CheckCircle,
        color: "text-green-500"
      };
    case "failed":
    case "review":
      return {
        Icon: AlertCircle,
        color: "text-amber-500"
      };
    default:
      return {
        Icon: Clock,
        color: "text-muted-foreground"
      };
  }
}