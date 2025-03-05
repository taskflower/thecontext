// src/components/ui/form-modal.tsx
import React, { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui";
import { AlertCircle } from "lucide-react";

interface FormModalProps {
  // Modal state
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  
  // Form elements
  children: ReactNode;
  
  // Form submission
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitDisabled?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  
  // Error handling
  error?: string | null;
  
  // Additional styling/options
  size?: "sm" | "md" | "lg" | "xl";
  preventClosing?: boolean;
}

export function FormModal({
  title,
  description,
  isOpen,
  onClose,
  children,
  onSubmit,
  isSubmitDisabled = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  error = null,
  size = "md",
  preventClosing = false,
}: FormModalProps) {
  // Size class mapping
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };
  
  // Handle modal close event
  const handleOpenChange = (open: boolean) => {
    if (!open && !preventClosing) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={onSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-2">{children}</div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default FormModal;