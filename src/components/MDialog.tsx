import React, { ReactNode } from 'react';
import {
  Dialog as UiDialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface MDialogProps {
  title: ReactNode | string;
  description?: ReactNode | string;
  children: ReactNode;
  footer?: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  maxWidth?: string;
}

const MDialog: React.FC<MDialogProps> = ({
  title,
  description,
  children,
  footer,
  isOpen,
  onOpenChange,
  maxWidth = "sm:max-w-2xl"
}) => {
  return (
    <UiDialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={maxWidth}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          {children}
        </div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </UiDialog>
  );
};

export default MDialog;