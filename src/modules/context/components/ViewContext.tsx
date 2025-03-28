import React, { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { ContextItem } from "../types";
import { useAppStore } from "../../store";
import { detectContentType } from "../utils";
import {
  CancelButton,
  DialogModal,
} from "@/components/studio";

interface ViewContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  contextItemId: string;
}

export const ViewContext: React.FC<ViewContextProps> = ({
  isOpen,
  setIsOpen,
  contextItemId,
}) => {
  const getContextItems = useAppStore((state) => state.getContextItems);
  const [contextItem, setContextItem] = useState<ContextItem | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Load context item data when component mounts or contextItemId changes
  useEffect(() => {
    if (isOpen && contextItemId) {
      const items = getContextItems();
      const item = items.find((item) => item.id === contextItemId);
      if (item) {
        setContextItem(item);
      }
    }
  }, [isOpen, contextItemId, getContextItems]);

  const handleClose = () => setIsOpen(false);

  const handleCopyContent = () => {
    if (!contextItem) return;
    navigator.clipboard.writeText(contextItem.content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Check if content is JSON
  const { type } = detectContentType(contextItem?.content || "");
  const isJson = type === "json";

  const renderFooter = () => (
    <div className="flex justify-between w-full">
      <button
        onClick={handleCopyContent}
        className="text-sm text-muted-foreground hover:text-foreground flex items-center"
      >
        <Copy className="h-4 w-4 mr-1" />
        {copySuccess ? "Copied!" : "Copy content"}
      </button>
      <CancelButton onClick={handleClose} />
    </div>
  );

  if (!contextItem) return null;

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="View Context Item"
      description="View context item details"
      footer={renderFooter()}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-1">Title</h3>
          <p className="text-xl font-black">{contextItem.title}</p>
        </div>

        <div>
          <div className="flex items-center">
            <h3 className="text-sm font-medium mb-1">Content</h3>
            {isJson && (
              <span className="text-xs text-blue-500 ml-2">(JSON)</span>
            )}
          </div>
          <div
            className={`px-3 py-2 border border-border rounded-md bg-muted/30 whitespace-pre-wrap max-h-96 overflow-y-auto ${
              isJson ? "font-mono text-sm" : ""
            }`}
          >
            {contextItem.content || "(No content)"}
          </div>
        </div>
      </div>
    </DialogModal>
  );
};