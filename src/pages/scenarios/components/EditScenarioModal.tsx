// src/pages/scenarios/components/EditScenarioModal.tsx
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormModal } from "@/components/ui/form-modal";
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
  const [error, setError] = useState<string | null>(null);

  // Set initial form values when scenario changes
  useEffect(() => {
    if (scenario) {
      setTitle(scenario.title);
      setDescription(scenario.description || "");
      setDueDate(scenario.dueDate);
      setError(null);
    }
  }, [scenario]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!scenario || !title.trim()) return;

    const result = updateScenario(scenario.id, {
      title,
      description,
      dueDate
    });
    
    if (!result.success) {
      setError(result.error || "Failed to update the scenario.");
      return;
    }
    
    // Reset and close
    setError(null);
    onClose();
  };

  if (!scenario) return null;

  return (
    <FormModal
      title="Edit Scenario"
      description="Update scenario details."
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitDisabled={!title.trim()}
      error={error}
      submitLabel="Save Changes"
    >
      <div className="grid gap-2">
        <Label htmlFor="title">Scenario Title</Label>
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
    </FormModal>
  );
};

export default EditScenarioModal;