// src/pages/tasks/TaskFlow/documents/components/NewDocumentModal.tsx
import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DocItem } from "../../types";
import { useDataStore, useUIStore } from "../../store";
import { Button, Input, Label, Textarea } from "@/components/ui";

const NewDocumentModal: React.FC = () => {
  const { addDocItem } = useDataStore();
  const { showNewDocumentModal, toggleNewDocumentModal, currentFolder } = useUIStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [metaKeys, setMetaKeys] = useState("");

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
      folderId: currentFolder,
      createdAt: currentTime,
      updatedAt: currentTime
    };

    addDocItem(newDocItem);
    
    // Reset form
    setTitle("");
    setContent("");
    setMetaKeys("");
    
    toggleNewDocumentModal();
  };

  return (
    <Dialog open={showNewDocumentModal} onOpenChange={toggleNewDocumentModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Document</DialogTitle>
          <DialogDescription>
            Add a new document to the current folder.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={toggleNewDocumentModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDocumentModal;