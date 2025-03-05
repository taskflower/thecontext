// src/pages/scenarios/components/NewScenarioModal.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FormModal } from "@/components/ui/form-modal";
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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) return;

    // Create a folder for this scenario
    const folderId = `folder-${Date.now()}`;
    
    // Add a folder for the scenario
    const folderResult = addFolder({
      id: folderId,
      name: title,
      parentId: 'scenarios', // Root folder for scenarios
      isScenarioFolder: true  // Mark as a scenario folder
    });

    // Check if folder creation was successful
    if (!folderResult.success) {
      setError(folderResult.error || "Failed to create scenario folder.");
      return;
    }

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

    const scenarioResult = addScenario(newScenario);
    
    // Check if scenario creation was successful
    if (!scenarioResult.success) {
      // If scenario creation failed, try to clean up the folder we just created
      // This is a best-effort cleanup
      addFolder({
        id: folderId,
        name: title,
        parentId: 'scenarios',
        isScenarioFolder: true
      });
      
      setError(scenarioResult.error || "Failed to create scenario.");
      return;
    }
    
    // Reset form
    setTitle("");
    setDescription("");
    setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setError(null);
    
    toggleNewScenarioModal();
  };

  return (
    <FormModal
      title="Create New Scenario"
      description="Add a new scenario to your dashboard."
      isOpen={true}
      onClose={toggleNewScenarioModal}
      onSubmit={handleSubmit}
      isSubmitDisabled={!title.trim()}
      error={error}
      submitLabel="Create Scenario"
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

export default NewScenarioModal;