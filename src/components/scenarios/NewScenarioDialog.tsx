// src/components/scenarios/NewScenarioDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useScenarioStore } from "@/stores/scenarioStore";

interface NewScenarioDialogProps {
  workspaceId: string;
}

export const NewScenarioDialog: React.FC<NewScenarioDialogProps> = ({
  workspaceId,
}) => {
  const { createScenario } = useScenarioStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateScenario = () => {
    if (!workspaceId || !name.trim()) return;
    
    createScenario(name.trim(), workspaceId, description.trim());
    setName("");
    setDescription("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Scenario
        </Button>
      </DialogTrigger>
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