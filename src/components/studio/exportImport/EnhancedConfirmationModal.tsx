// src/components/studio/exportImport/EnhancedConfirmationModal.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EnhancedConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const EnhancedConfirmationModal: React.FC<EnhancedConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center text-primary gap-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-lg font-bold">{title}</h3>
        </div>

        <div className="py-2">
          <p className="mb-2">{message}</p>

          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action will modify your workspaces and scenarios. Make sure you have a backup before proceeding.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export default EnhancedConfirmationModal;