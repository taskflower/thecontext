import React, { ReactNode } from "react";
import { X, Save } from "lucide-react";
import { cn } from "@/utils/utils";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  variant?: "default" | "primary" | "destructive";
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  children,
  variant = "default",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2",
        variant === "default" &&
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        variant === "destructive" &&
          "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90"
      )}
    >
      {children}
    </button>
  );
};

export const CancelButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => {
  return (
    <ActionButton onClick={onClick}>
      <X className="h-4 w-4 mr-2" />
      Cancel
    </ActionButton>
  );
};

export const SaveButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
}> = ({ onClick, disabled = false }) => {
  return (
    <ActionButton onClick={onClick} disabled={disabled} variant="primary">
      <Save className="h-4 w-4 mr-2" />
      Save Changes
    </ActionButton>
  );
};
