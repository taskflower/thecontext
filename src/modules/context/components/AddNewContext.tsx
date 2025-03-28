import React, { useState } from "react";
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