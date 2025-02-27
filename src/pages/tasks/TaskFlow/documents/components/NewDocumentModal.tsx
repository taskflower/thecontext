// src/pages/tasks/TaskFlow/documents/components/NewDocumentModal.tsx

import React, { useState } from "react";
import { useTaskFlowStore } from "../../store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NewDocumentModal: React.FC = () => {
  const { showNewDocumentModal, toggleNewDocumentModal, addDocument, currentFolder } = useTaskFlowStore();
  const [metaKeys, setMetaKeys] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const currentTime = new Date().toISOString();
    const newDocument = {
      id: `doc-${Date.now()}`,
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      metaKeys: metaKeys.split(",").map(key => key.trim()).filter(key => key !== ""),
      schema: {},
      folderId: currentFolder,
      createdAt: currentTime,
      updatedAt: currentTime
    };

    addDocument(newDocument);
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
              <Input id="title" name="title" required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                className="h-32"
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
            <Button type="submit">
              Create Document
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDocumentModal;