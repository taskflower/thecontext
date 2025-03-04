// src/pages/scenarios/components/NewScenarioModal.tsx
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

interface NewScenarioModalProps {
  toggleNewScenarioModal: () => void;
}

const NewScenarioModal: React.FC<NewScenarioModalProps> = ({ toggleNewScenarioModal }) => {
  const { addScenario, addFolder } = useDataStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default: 1 week from now
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) return;

    // Create a folder for this scenario
    const folderId = `folder-${Date.now()}`;
    
    // Add a folder for the scenario
    addFolder({
      id: folderId,
      name: title,
      parentId: 'scenarios', // Root folder for scenarios
      isScenarioFolder: true  // Mark as a scenario folder
    });

    // Create and add the scenario
    const newScenario = {
      id: `proj-${Date.now()}`,
      title,
      description,
      progress: 0,
      tasks: 0,
      completedTasks: 0,
      dueDate,
      folderId
    };

    addScenario(newScenario);
    
    // Reset form
    setTitle("");
    setDescription("");
    setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    toggleNewScenarioModal();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => {
      if (!open) toggleNewScenarioModal();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Scenario</DialogTitle>
          <DialogDescription>
            Add a new scenario to your dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Scenario Title</Label>
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
            <Button type="button" variant="outline" onClick={toggleNewScenarioModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create Scenario
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewScenarioModal;