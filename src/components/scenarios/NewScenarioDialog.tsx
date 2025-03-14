// src/components/scenarios/NewScenarioDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useScenarioStore } from "@/stores/scenarioStore";
import { useDialog } from "@/context/DialogContext";

export const NewScenarioDialog: React.FC = () => {
  const { createScenario } = useScenarioStore();
  const { isDialogOpen, closeDialog, getDialogProps } = useDialog();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const open = isDialogOpen('newScenario');
  const { workspaceId } = getDialogProps('newScenario');

  const handleOpenChange = (open: boolean) => {
    if (!open) closeDialog('newScenario');
  };

  const handleCreateScenario = () => {
    if (!workspaceId || !name.trim()) return;
    
    createScenario(name.trim(), workspaceId, description.trim());
    setName("");
    setDescription("");
    closeDialog('newScenario');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Scenario</DialogTitle>
          <DialogDescription>
            Create a new scenario for your prompt workflows.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Scenario"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What this scenario is for..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateScenario} disabled={!name.trim()}>
            Create Scenario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};