/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/shared/JsonUtils.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MDialog from "@/components/MDialog";
import { FileUp, FileDown, AlertTriangle } from "lucide-react";
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

interface ExportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: () => void;
  title: string;
  description: string;
  statistics: React.ReactNode;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onOpenChange,
  onExport,
  title,
  description,
  statistics
}) => {
  return (
    <MDialog
      title={title}
      description={description}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onExport}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </>
      }
    >
      <div className="bg-slate-50 p-4 rounded-md border space-y-2">
        {statistics}
      </div>
    </MDialog>
  );
};

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelect: (file: File) => void;
  title: string;
  description: string;
  warningMessage?: string;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  isOpen,
  onOpenChange,
  onFileSelect,
  title,
  description,
  warningMessage
}) => {
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <MDialog
      title={title}
      description={description}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-md p-8">
          <div className="space-y-2 text-center">
            <div className="text-slate-500">
              Select a JSON file to import
            </div>
            <div className="relative">
              <Input
                type="file"
                accept=".json"
                onChange={handleFileSelection}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button variant="outline">
                <FileUp className="h-4 w-4 mr-2" />
                Select File
              </Button>
            </div>
          </div>
        </div>

        {warningMessage && (
          <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <div className="text-sm">{warningMessage}</div>
          </div>
        )}
      </div>
    </MDialog>
  );
};

interface ImportConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export const ImportConfirmation: React.FC<ImportConfirmationProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Confirm Import
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Utility functions for common JSON operations
export const exportDataAsJson = (data: any, filename: string): void => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const importDataFromJson = (
  file: File, 
  onSuccess: (data: any) => void, 
  onError?: (error: Error) => void
): void => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target!.result as string);
      onSuccess(data);
    } catch (error) {
      console.error("Error parsing JSON file:", error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };
  reader.readAsText(file);
};

// Higher-order component for JSON import/export functionality
export interface JsonImportExportProps {
  onExport: () => any;
  onImport: (data: any) => void;
  exportFilename: string;
  exportTitle: string;
  exportDescription: string;
  exportStatistics: React.ReactNode;
  importTitle: string;
  importDescription: string;
  importWarning?: string;
  importConfirmTitle: string;
  importConfirmDescription: string;
  children?: React.ReactNode;
}

export const JsonImportExport: React.FC<JsonImportExportProps> = ({
  onExport,
  onImport,
  exportFilename,
  exportTitle,
  exportDescription,
  exportStatistics,
  importTitle,
  importDescription,
  importWarning,
  importConfirmTitle,
  importConfirmDescription,
  children
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showImportConfirmation, setShowImportConfirmation] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);

  const handleExport = () => {
    const data = onExport();
    exportDataAsJson(data, exportFilename);
    setShowExportModal(false);
  };

  const handleFileSelect = (file: File) => {
    setFileToImport(file);
    setShowImportModal(false);
    setShowImportConfirmation(true);
  };

  const confirmImport = () => {
    if (fileToImport) {
      importDataFromJson(
        fileToImport,
        (data) => {
          onImport(data);
          setShowImportConfirmation(false);
          setFileToImport(null);
        },
        () => {
          setShowImportConfirmation(false);
          setFileToImport(null);
          // Could add error handling modal here
        }
      );
    }
  };

  return (
    <>
      {children}
      
      <ExportDialog
        isOpen={showExportModal}
        onOpenChange={setShowExportModal}
        onExport={handleExport}
        title={exportTitle}
        description={exportDescription}
        statistics={exportStatistics}
      />
      
      <ImportDialog
        isOpen={showImportModal}
        onOpenChange={setShowImportModal}
        onFileSelect={handleFileSelect}
        title={importTitle}
        description={importDescription}
        warningMessage={importWarning}
      />
      
      <ImportConfirmation
        isOpen={showImportConfirmation}
        onOpenChange={setShowImportConfirmation}
        onConfirm={confirmImport}
        title={importConfirmTitle}
        description={importConfirmDescription}
      />
    </>
  );
};

export default JsonImportExport;