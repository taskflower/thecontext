// src/modules/shared/JsonImportModal.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import MDialog from "@/components/MDialog";
import { FileUp, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";

interface JsonImportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  warningMessage: string;
  confirmTitle: string;
  confirmDescription: string;
  onFileSelect: (file: File) => void;
}

const JsonImportModal: React.FC<JsonImportModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  warningMessage,
  confirmTitle,
  confirmDescription,
  onFileSelect
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowConfirmation(true);
      onOpenChange(false); // Close the import modal when showing confirmation
    }
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      setSelectedFile(null);
      setShowConfirmation(false);
    }
  };

  const handleCancelConfirmation = () => {
    setSelectedFile(null);
    setShowConfirmation(false);
  };

  return (
    <>
      {/* Main Import Dialog */}
      <MDialog
        title={title}
        description={description}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        footer={
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-md p-8">
            <div className="space-y-2 text-center">
              <div className="text-slate-500">
                Select a JSON file to import
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelection}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Button variant="outline">
                  <FileUp className="h-4 w-4 mr-2" />
                  Select File
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <div className="text-sm">{warningMessage}</div>
          </div>
        </div>
      </MDialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirmation}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default JsonImportModal;