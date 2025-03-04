// src/pages/scenarios/components/EditScenarioModal.tsx
import React, { useState, useEffect } from "react";

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
import { Scenario } from "@/types";

interface EditScenarioModalProps {
  scenario: Scenario | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditScenarioModal: React.FC<EditScenarioModalProps> = ({ scenario, isOpen, onClose }) => {
  const { updateScenario } = useDataStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Set initial form values when scenario changes
  useEffect(() => {
    if (scenario) {
      setTitle(scenario.title);
      setDescription(scenario.description || "");
      setDueDate(scenario.dueDate);
    }
  }, [scenario]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!scenario || !title.trim()) return;

    updateScenario(scenario.id, {
      title,
      description,
      dueDate
    });
    
    // Reset and close
    onClose();
  };

  if (!scenario) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Scenario</DialogTitle>
          <DialogDescription>
            Update scenario details.
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditScenarioModal;