// src/pages/scenarios/components/EditScenarioModal.tsx
import { useState, useEffect } from "react";
import { Scenario } from "@/types";
import { FormModal, Input, Label, Textarea } from "@/components/ui";
import scenarioService from "../services/ScenarioService";
import { useToast } from "@/hooks/useToast";

interface EditScenarioModalProps {
  scenario: Scenario | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditScenarioModal: React.FC<EditScenarioModalProps> = ({
  scenario,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ustawienie początkowych wartości formularza
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
    
    setIsSubmitting(true);
    setError(null);

    const result = scenarioService.updateScenario(scenario.id, {
      title,
      description,
      dueDate,
    });

    if (!result.success) {
      setError(result.error || "Failed to update the scenario.");
      setIsSubmitting(false);
      return;
    }

    // Powiadomienie o sukcesie
    toast({
      title: "Success",
      description: "Scenario updated successfully",
      variant: "default"
    });

    setIsSubmitting(false);
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
      isSubmitDisabled={!title.trim() || isSubmitting}
      error={error}
      submitLabel={isSubmitting ? "Saving..." : "Save Changes"}
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