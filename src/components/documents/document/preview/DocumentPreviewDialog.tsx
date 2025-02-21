import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { MarkdownPreview } from "../../MarkdownComponents";

interface DocumentPreviewDialogProps {
  document: { title: string; content: string } | null;
  onClose: () => void;
}

export const DocumentPreviewDialog: React.FC<DocumentPreviewDialogProps> = ({ document, onClose }) => {
  return (
    <Dialog open={!!document} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document?.title}</DialogTitle>
        </DialogHeader>
        {document && <MarkdownPreview content={document.content} />}
      </DialogContent>
    </Dialog>
  );
};
