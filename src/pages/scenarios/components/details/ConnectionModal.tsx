// src/pages/scenarios/components/details/ConnectionModal.tsx
import { useState } from "react";
import { FormModal } from "@/components/ui/form-modal";
import { useScenarioStore } from "@/store";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

import scenarioService from "../../services/ScenarioService";
import { useToast } from "@/hooks/useToast";

interface ConnectionModalProps {
  scenarioId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ConnectionModal: React.FC<ConnectionModalProps> = ({
  scenarioId,
  isOpen,
  onClose,
}) => {
  const { scenarios } = useScenarioStore();
  const { toast } = useToast();
  const [targetScenarioId, setTargetScenarioId] = useState("");
  const [connectionType, setConnectionType] = useState("related");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pobieranie scenariusza i dostępnych połączeń przez serwis
  // Używanie serwisu zamiast bezpośredniego dostępu do store
  const currentScenario = scenarioService.getScenarioById(scenarioId);
  const connectedIds = currentScenario?.connections || [];
  const availableScenarios = scenarios.filter(
    (s) => s.id !== scenarioId && !connectedIds.includes(s.id)
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!targetScenarioId) {
      setError("Please select a scenario to connect with.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    const result = scenarioService.connectScenarios(
      scenarioId,
      targetScenarioId,
      connectionType
    );

    if (!result.success) {
      setError(result.error || "Failed to create connection");
      setIsSubmitting(false);
      return;
    }

    // Powiadomienie o sukcesie
    toast({
      title: "Success",
      description: "Scenarios connected successfully",
      variant: "default"
    });

    setTargetScenarioId("");
    setConnectionType("related");
    setError(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <FormModal
      title="Connect Scenarios"
      description="Create connections between this scenario and others."
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitDisabled={!targetScenarioId || isSubmitting}
      error={error}
      submitLabel={isSubmitting ? "Connecting..." : "Create Connection"}
    >
      {availableScenarios.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground">
            No available scenarios to connect. All scenarios are already connected
            or there are no other scenarios.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-2">
            <Label htmlFor="targetScenario">Select Scenario</Label>
            <Select
              value={targetScenarioId}
              onValueChange={(value) => {
                setTargetScenarioId(value);
                setError(null);
              }}
            >
              <SelectTrigger id="targetScenario">
                <SelectValue placeholder="Select a scenario to connect" />
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

          <div className="grid gap-2 mt-4">
            <Label htmlFor="connectionType">Connection Type</Label>
            <Select
              value={connectionType}
              onValueChange={(value) => setConnectionType(value)}
            >
              <SelectTrigger id="connectionType">
                <SelectValue placeholder="Select connection type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="related">Related</SelectItem>
                <SelectItem value="dependency">Dependency</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="child">Child</SelectItem>
                <SelectItem value="follows">Follows</SelectItem>
                <SelectItem value="precedes">Precedes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </FormModal>
  );
};

export default ConnectionModal;