// src/pages/steps/StepsList.tsx
import { Plus, Edit, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Step } from "@/types";
import { useWizardStore } from "@/store/wizardStore";
import { StepResult } from "@/pages/steps/StepResult";
import { getPlugin } from "@/pages/stepsPlugins/registry";
import { StatusBadge } from "@/components/status";
import { StepTypeIcon } from "@/components/status/StepTypeIcon";
import stepService from "./services/StepService";

interface StepsListProps {
  steps: Step[];
  taskId: string;
  onAddStep: () => void;
  onEditStep: (stepIndex: number) => void;
}

export function StepsList({
  steps,
  taskId,
  onAddStep,
  onEditStep,
}: StepsListProps) {
  const { openWizard } = useWizardStore();

  const handleExecuteStep = (stepId: string) => {
    // Wykorzystanie StepService zamiast bezpośredniego otwierania wizarda
    const success = stepService.executeStep(stepId);
    
    // Jeśli StepService nie może automatycznie wykonać kroku,
    // otwieramy wizard ręcznie
    if (!success) {
      openWizard(taskId, stepId);
    }
  };

  // Funkcja do zmiany kolejności kroków - zakomentowana do przyszłej implementacji drag&drop
  // const handleReorderSteps = (stepIds: string[]) => {
  //   stepService.reorderSteps(taskId, stepIds);
  // };

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-4 py-3 border-b">
        <h3 className="text-sm font-bold">Workflow Steps</h3>
        <Button variant="outline" size="sm" onClick={onAddStep}>
          <Plus className="h-4 w-4 mr-1" />
          Add Step
        </Button>
      </div>

      <ScrollArea className="h-full">
        <div className="space-y-3 bg-background">
          {steps.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground border rounded-md">
              No steps defined yet. Add steps to complete this task.
            </div>
          ) : (
            steps.map((step, index) => (
              <StepItem
                key={step.id}
                step={step}
                index={index}
                onEdit={() => onEditStep(index)}
                onExecute={() => handleExecuteStep(step.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface StepItemProps {
  step: Step;
  index: number;
  onEdit: () => void;
  onExecute: () => void;
}

function StepItem({ step, index, onEdit, onExecute }: StepItemProps) {
  const plugin = getPlugin(step.type);
  const stepName = plugin?.name || "Unknown Step";

  return (
    <div className="overflow-hidden border-b rounded-md">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="h-6 w-6 p-0 flex items-center justify-center rounded-full"
            >
              {index + 1}
            </Badge>
            <h3 className="text-sm font-medium">{step.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={step.status} />
            <Badge variant="outline" className="flex items-center gap-1">
              <StepTypeIcon type={step.type} size={14} />
              {stepName}
            </Badge>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
              title="Edit step"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={onExecute}
              title="Execute step"
              disabled={step.status === "completed"}
            >
              <PlayCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      {step.result && (
        <div className="px-4 py-3 bg-muted/50 border-t">
          <StepResult step={step} />
        </div>
      )}
    </div>
  );
}

export default StepsList;