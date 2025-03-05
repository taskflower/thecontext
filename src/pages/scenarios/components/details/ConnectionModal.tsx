// src/pages/documents/components/NewDocumentModal.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";

import { FormModal } from "@/components/ui/form-modal";
import { useDataStore, useUIStore } from "@/store";
import { DocItem } from "@/types";
import { Input, Label, Textarea } from "@/components/ui";

const NewDocumentModal: React.FC = () => {
  const { addDocItem } = useDataStore();
  const { showNewDocumentModal, toggleNewDocumentModal } = useUIStore();
  
  // Get the current folder ID from URL params
  const { folderId = "root" } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaKeys, setMetaKeys] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) return;

    const currentTime = new Date().toISOString();
    const newDocItem: DocItem = {
      id: `doc-${Date.now()}`,
      title,
      content,
      metaKeys: metaKeys.split(",").map(key => key.trim()).filter(key => key !== ""),
      schema: {},
      folderId, // Use the folder ID from URL params
      createdAt: currentTime,
      updatedAt: currentTime
    };

    const result = addDocItem(newDocItem);
    
    if (!result.success) {
      setError(result.error || "Failed to create document.");
      return;
    }

    // Reset form
    setTitle("");
    setContent("");
    setMetaKeys("");
    
    toggleNewDocumentModal();
  };

  return (
    <FormModal
      title="Create New Document"
      description="Add a new document to the current folder."
      isOpen={showNewDocumentModal}
      onClose={toggleNewDocumentModal}
      onSubmit={handleSubmit}
      isSubmitDisabled={!title.trim()}
      error={error}
      submitLabel="Create Document"
    >
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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