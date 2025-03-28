// src/modules/context/components/ContextDialogs.tsx
import React, { useState } from "react";
import { X, Copy } from "lucide-react";
import { ContextItem } from "../types";
import { useAppStore } from "../../store";
import { detectContentType } from "../utils";

interface ContextDialogProps {
  title: string;
  formData: {
    title: string;
    content: string;
  };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSubmit: () => void;
  handleClose: () => void;
  readonly?: boolean;
}

export const ContextDialog: React.FC<ContextDialogProps> = ({
  title,
  formData,
  handleChange,
  handleSubmit,
  handleClose,
  readonly = false,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyContent = () => {
    navigator.clipboard.writeText(formData.content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const { type } = detectContentType(formData.content);
  const isJson = type === "json";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter context title"
              className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              readOnly={readonly}
              disabled={readonly}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="content" className="block text-sm font-medium">
                Content {isJson && <span className="text-blue-500 ml-1">(JSON)</span>}
              </label>
              {readonly && (
                <button 
                  onClick={handleCopyContent}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copySuccess ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Enter context content"
              rows={10}
              className={`w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                isJson ? "font-mono text-sm" : ""
              }`}
              readOnly={readonly}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
            >
              {readonly ? "Close" : "Cancel"}
            </button>
            {!readonly && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                {title.startsWith("Add") ? "Add" : "Update"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface EditContextDialogProps {
  item: ContextItem;
  handleClose: () => void;
}

export const EditContextDialog: React.FC<EditContextDialogProps> = ({
  item,
  handleClose,
}) => {
  const updateContextItem = useAppStore((state) => state.updateContextItem);
  const [formData, setFormData] = useState({
    title: item.title,
    content: item.content,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    updateContextItem(item.id, {
      title: formData.title,
      content: formData.content,
    });
    handleClose();
  };

  return (
    <ContextDialog
      title="Edit Context Item"
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleClose={handleClose}
    />
  );
};

interface ViewContextDialogProps {
  item: ContextItem;
  handleClose: () => void;
}

export const ViewContextDialog: React.FC<ViewContextDialogProps> = ({
  item,
  handleClose,
}) => {
  const formData = {
    title: item.title,
    content: item.content,
  };

  // Pusta funkcja handleChange, bo nie potrzebujemy zmian w trybie podglądu
  const handleChange = () => {};
  // Pusta funkcja handleSubmit, bo nie potrzebujemy zapisywać w trybie podglądu
  const handleSubmit = () => {};

  return (
    <ContextDialog
      title="View Context Item"
      formData={formData}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      handleClose={handleClose}
      readonly={true}
    />
  );
};