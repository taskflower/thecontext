// src/pages/documents/components/NewDocumentModal.tsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";

import { useUIStore } from "@/store";
import { FormModal, Input, Label, Textarea } from "@/components/ui";
import { documentService } from "../services";
import { useToast } from "@/hooks/useToast";

const NewDocumentModal: React.FC = () => {
  const { showNewDocumentModal, toggleNewDocumentModal } = useUIStore();
  const { toast } = useToast();

  // Get the current folder ID from URL params
  const { folderId = "root" } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaKeys, setMetaKeys] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) return;
    
    setIsSubmitting(true);
    setError(null);

    // Convert comma-separated metadata to array
    const metaKeyArray = metaKeys
      .split(",")
      .map((key) => key.trim())
      .filter((key) => key !== "");

    // Use the service to create the document
    const result = documentService.createDocument(
      title,
      content,
      metaKeyArray,
      folderId
    );

    if (!result.success) {
      setError(result.error || "Failed to create document.");
      setIsSubmitting(false);
      return;
    }

    // Show success toast
    toast({
      title: "Success",
      description: "Document created successfully",
      variant: "default"
    });

    // Reset form
    setTitle("");
    setContent("");
    setMetaKeys("");
    setError(null);
    setIsSubmitting(false);

    toggleNewDocumentModal();
  };

  return (
    <FormModal
      title="Create New Document"
      description="Add a new document to the current folder."
      isOpen={showNewDocumentModal}
      onClose={toggleNewDocumentModal}
      onSubmit={handleSubmit}
      isSubmitDisabled={!title.trim() || isSubmitting}
      error={error}
      submitLabel={isSubmitting ? "Creating..." : "Create Document"}
    >
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null); // Clear error when input changes
          }}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          className="h-32"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="metaKeys">Tags (comma-separated)</Label>
        <Input
          id="metaKeys"
          value={metaKeys}
          onChange={(e) => setMetaKeys(e.target.value)}
          placeholder="project, notes, important"
        />
      </div>
    </FormModal>
  );
};

export default NewDocumentModal;