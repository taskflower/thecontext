// src/pages/projects/components/details/AddScenarioModal.tsx
import { useState } from "react";
import { FormModal } from "@/components/ui/form-modal";
import { useScenarioStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

import projectService from "../../services/ProjectService";
import { useToast } from "@/hooks/useToast";

interface AddScenarioModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const AddScenarioModal: React.FC<AddScenarioModalProps> = ({
  projectId,
  isOpen,
  onClose,
}) => {
  const { scenarios } = useScenarioStore();
  const { toast } = useToast();
  const [scenarioId, setScenarioId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the current project to fetch already associated scenarios
  const project = projectService.getProjectById(projectId);
  const associatedScenarioIds = project?.scenarios || [];
  
  // Filter out scenarios that are already associated with this project
  const availableScenarios = scenarios.filter(
    (s) => !associatedScenarioIds.includes(s.id)
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!scenarioId) {
      setError("Please select a scenario to add to the project.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const result = projectService.addScenarioToProject(
      projectId,
      scenarioId
    );

    if (!result.success) {
      setError(result.error || "Failed to add scenario to project");
      setIsSubmitting(false);
      return;
    }

    // Notification of success
    toast({
      title: "Success",
      description: "Scenario added to project successfully",
      variant: "default"
    });

    setScenarioId("");
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <FormModal
      title="Add Scenario to Project"
      description="Select a scenario to add to this project."
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitDisabled={!scenarioId || isSubmitting}
      error={error}
      submitLabel={isSubmitting ? "Adding..." : "Add Scenario"}
    >
      {availableScenarios.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground">
            No available scenarios to add. All scenarios are already part of this project
            or there are no scenarios created yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          <Label htmlFor="scenarioId">Select Scenario</Label>
          <Select
            value={scenarioId}
            onValueChange={(value) => {
              setScenarioId(value);
              setError(null);
            }}
          >
            <SelectTrigger id="scenarioId">
              <SelectValue placeholder="Select a scenario to add" />
            </SelectTrigger>
            <SelectContent>
              {availableScenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </FormModal>
  );
};

export default AddScenarioModal;