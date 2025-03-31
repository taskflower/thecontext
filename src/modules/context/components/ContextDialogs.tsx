// src/modules/context/components/ContextDialogs.tsx
import React, { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { ContextItem } from "../types";
import { useAppStore } from "../../store";
import { detectContentType } from "../utils";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
  TextAreaField,
} from "@/components/studio";

interface AddNewContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const AddNewContext: React.FC<AddNewContextProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const addContextItem = useAppStore((state) => state.addContextItem);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    addContextItem({
      title: formData.title,
      content: formData.content,
    });
    setFormData({ title: "", content: "" });
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  const renderFooter = () => (
    <>
      <CancelButton onClick={handleClose} />
      <SaveButton onClick={handleSubmit} disabled={!formData.title.trim()} />
    </>
  );

  // Detect if content is JSON
  const { type } = detectContentType(formData.content);
  const isJson = type === "json";

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Context Item"
      description="Create a new context item for your workspace"
      footer={renderFooter()}
    >
      <InputField
        id="title"
        name="title"
        label="Title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Context item title"
      />

      <div className="space-y-1">
        {isJson && (
          <div className="text-xs text-blue-500 mb-1">
            Content detected as JSON
          </div>
        )}
        <TextAreaField
          id="content"
          name="content"
          label="Content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Enter context content"
          rows={8}
         
        />
      </div>
    </DialogModal>
  );
};

interface EditContextProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  contextItemId: string;
}

export const EditContext: React.FC<EditContextProps> = ({
  isOpen,
  setIsOpen,
  contextItemId,
}) => {
  const getContextItems = useAppStore((state) => state.getContextItems);
  const updateContextItem = useAppStore((state) => state.updateContextItem);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

  // Load context item data when component mounts or contextItemId changes
  useEffect(() => {
    if (isOpen && contextItemId) {
      const items = getContextItems();
      const item = items.find((item) => item.id === contextItemId);
      if (item) {
        setFormData({
          title: item.title,
          content: item.content || "",
        });
      }
    }
  }, [isOpen, contextItemId, getContextItems]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    updateContextItem(contextItemId, {
      title: formData.title,
      content: formData.content,
    });
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  const renderFooter = () => (
    <>
      <CancelButton onClick={handleClose} />
      <SaveButton onClick={handleSubmit} disabled={!formData.title.trim()} />
    </>
  );

  // Detect if content is JSON
  const { type } = detectContentType(formData.content);
  const isJson = type === "json";

  return (
    <DialogModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Context Item"
      description="Update context item details"
      footer={renderFooter()}
    >
      <InputField
        id="title"
        name="title"
        label="Title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Context item title"
      />

      <div className="space-y-1">
        {isJson && (
          <div className="text-xs text-blue-500 mb-1">
            Content detected as JSON
          </div>
        )}
        <TextAreaField
          id="content"
          name="content"
          label="Content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Enter context content"
          rows={8}
         
        />
      </div>
    </DialogModal>
  );
};

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