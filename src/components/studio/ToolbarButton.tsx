// components/ToolbarButton.tsx
import { cn } from "@/utils/utils";
import React from "react";

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  active,
  onClick,
}) => {
  return (
    <button
      className={cn(
        "py-1.5 px-3 rounded-md flex items-center gap-2 text-sm font-medium",
        active
          ? "bg-muted text-primary"
          : "text-muted-foreground hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};