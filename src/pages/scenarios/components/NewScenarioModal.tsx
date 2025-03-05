// src/pages/scenarios/components/NewScenarioModal.tsx
import { useState } from "react";
import { FormModal } from "@/components/ui/form-modal";
import { Input, Label, Textarea } from "@/components/ui";
import scenarioService from "../services/ScenarioService";
import { useToast } from "@/hooks/useToast";

interface NewScenarioModalProps {
  toggleNewScenarioModal: () => void;
}

const NewScenarioModal: React.FC<NewScenarioModalProps> = ({
  toggleNewScenarioModal,
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // Default: 1 week from now
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) return;
    
    setIsSubmitting(true);
    setError(null);

    const result = scenarioService.createScenario(title, description, dueDate);

    if (!result.success) {
      setError(result.error || "Failed to create scenario");
      setIsSubmitting(false);
      return;
    }

    // Powiadomienie o sukcesie
    toast({
      title: "Success",
      description: "Scenario created successfully",
      variant: "default"
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDueDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    );
    setError(null);
    setIsSubmitting(false);

    toggleNewScenarioModal();
  };

  return (
    <FormModal
      title="Create New Scenario"
      description="Add a new scenario to your dashboard."
      isOpen={true}
      onClose={toggleNewScenarioModal}
      onSubmit={handleSubmit}
      isSubmitDisabled={!title.trim() || isSubmitting}
      error={error}
      submitLabel={isSubmitting ? "Creating..." : "Create Scenario"}
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