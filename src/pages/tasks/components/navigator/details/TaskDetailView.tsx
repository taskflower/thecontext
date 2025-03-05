// src/pages/tasks/components/navigator/details/TaskDetailView.tsx
import { useState } from "react";
import { HelpCircle } from "lucide-react";

import {
  useScenarioStore,
  useStepStore,
  useTaskStore,
  useWizardStore,
} from "@/store";
import {
  StepAddDialog,
  StepEditDialog,
  StepHelpComponent,
  StepsList,
} from "@/pages/steps";
import { Button, Card, CardContent } from "@/components/ui";
import { TaskHeader, TaskInfo } from "../..";

export function TaskDetailView() {
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [isEditingStep, setIsEditingStep] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Fixed: dataStore doesn't have scenarios directly
  const { scenarios = [] } = useScenarioStore() || { scenarios: [] };
  
  const { tasks = [] } = useTaskStore() || { tasks: [] };
  const { getTaskSteps = () => [] } = useStepStore() || { getTaskSteps: () => [] };
  const { activeTaskId } = useWizardStore() || { activeTaskId: null };

  // Get selected task
  const task = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  const steps = activeTaskId
    ? getTaskSteps(activeTaskId).sort((a, b) => a.order - b.order)
    : [];

  // Get scenario name for the task
  const scenarioName = task?.scenarioId && scenarios.length
    ? scenarios.find((p) => p.id === task.scenarioId)?.title || "Unknown Project"
    : "No project";

  // If no task is selected, show placeholder
  if (!task) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-semibold">Task Details</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Select a task to view details
          </p>
        </div>
      </div>
    );
  }

  const handleEditStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    setIsEditingStep(true);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Task Header */}
      <TaskHeader task={task} />

      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          {/* Task Info Section */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <TaskInfo
                description={task.description}
                scenarioId={task.scenarioId}
                scenarioName={scenarioName}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 whitespace-nowrap ml-4"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle size={16} />
              {showHelp ? "Hide Guide" : "Workflow Guide"}
            </Button>
          </div>

          {/* Help section */}
          {showHelp && (
            <Card>
              <CardContent className="pt-6">
                <StepHelpComponent />
              </CardContent>
            </Card>
          )}

          {/* Steps List Section */}
          <div className="bg-white rounded-md shadow-sm border">
            <StepsList
              steps={steps}
              onAddStep={() => setIsAddingStep(true)}
              onEditStep={handleEditStep}
              taskId={task.id}
            />
          </div>
        </div>
      </div>

      {/* Add Step Dialog */}
      {isAddingStep && (
        <StepAddDialog
          taskId={task.id}
          open={isAddingStep}
          onClose={() => setIsAddingStep(false)}
        />
      )}

      {/* Edit Step Dialog */}
      {isEditingStep &&
        currentStepIndex !== null &&
        steps[currentStepIndex] && (
          <StepEditDialog
            step={steps[currentStepIndex]}
            open={isEditingStep}
            onClose={() => setIsEditingStep(false)}
          />
        )}
    </div>
  );
}

export default TaskDetailView;