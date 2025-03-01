// src/pages/steps/StepsList.tsx

import { Plus, Edit, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Step } from "@/types";
import { useWizardStore } from "@/store/wizardStore";
import { StepResult } from "@/pages/steps/StepResult";

interface StepsListProps {
  steps: Step[];
  taskId: string;
  onAddStep: () => void;
  onEditStep: (stepIndex: number) => void;
}

export function StepsList({ steps, taskId, onAddStep, onEditStep }: StepsListProps) {
  const { openWizard } = useWizardStore();

  const handleExecuteStep = (stepId: string) => {
    openWizard(taskId, stepId);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Kroki</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddStep}
        >
          <Plus className="h-4 w-4 mr-1" />
          Dodaj krok
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-350px)]">
        <div className="space-y-3">
          {steps.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground border rounded-md">
              Brak zdefiniowanych kroków. Dodaj kroki, aby wykonać to zadanie.
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
  return (
    <div className="overflow-hidden border rounded-md">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Badge
              variant="outline"
              className="h-6 w-6 p-0 flex items-center justify-center rounded-full"
            >
              {index + 1}
            </Badge>
            {step.title}
          </h3>
          <div className="flex items-center gap-2">
            {getStatusBadge(step.status)}
            <Badge variant="outline">{step.type}</Badge>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
              title="Edytuj krok"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={onExecute}
              title="Wykonaj krok"
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

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="outline">Oczekujący</Badge>;
    case "in-progress":
    case "in_progress":
      return <Badge variant="secondary">W trakcie</Badge>;
    case "completed":
      return <Badge>Ukończony</Badge>;
    case "failed":
      return <Badge variant="destructive">Nieudany</Badge>;
    case "skipped":
      return <Badge variant="outline">Pominięty</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default StepsList;