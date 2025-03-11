// src/modules/shared/JsonExportModal.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import MDialog from "@/components/MDialog";
import { FileDown } from "lucide-react";

interface JsonExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onExport: () => void;
  statistics: React.ReactNode;
}

const JsonExportModal: React.FC<JsonExportModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  onExport,
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

export default JsonExportModal;