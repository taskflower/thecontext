// components/TabButton.tsx
import { cn } from "@/utils/utils";
import React from "react";

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({
  icon,
  label,
  active,
  onClick,
}) => {
  return (
    <button
      className={cn(
        "flex-1 py-2 px-3 text-xs font-medium rounded-md flex flex-col items-center gap-1",
        active
          ? "bg-background text-primary"
          : "text-muted-foreground hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};
