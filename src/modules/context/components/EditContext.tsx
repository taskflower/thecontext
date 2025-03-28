import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store";
import { detectContentType } from "../utils";
import {
  CancelButton,
  DialogModal,
  InputField,
  SaveButton,
  TextAreaField,
} from "@/components/studio";

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