// src/pages/projects/components/NewProjectModal.tsx
import React, { useState } from "react";

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
import { useDataStore } from "@/store";

interface NewProjectModalProps {
  toggleNewProjectModal: () => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ toggleNewProjectModal }) => {
  const { addProject, addFolder } = useDataStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default: 1 week from now
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) return;

    // Create a folder for this project
    const folderId = `folder-${Date.now()}`;
    
    // Add a folder for the project
    addFolder({
      id: folderId,
      name: title,
      parentId: 'projects', // Root folder for projects
      isProjectFolder: true  // Mark as a project folder
    });

    // Create and add the project
    const newProject = {
      id: `proj-${Date.now()}`,
      title,
      description,
      progress: 0,
      tasks: 0,
      completedTasks: 0,
      dueDate,
      folderId
    };

    addProject(newProject);
    
    // Reset form
    setTitle("");
    setDescription("");
    setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    toggleNewProjectModal();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => {
      if (!open) toggleNewProjectModal();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to your dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Project Title</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="h-24"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={toggleNewProjectModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;