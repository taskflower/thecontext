// src/pages/tasks/components/navigator/TaskDetailView.tsx
import React, { useState } from "react";
import { useDataStore } from "@/store/dataStore";
import { useStepStore } from "@/store/stepStore";
import { useWizardStore } from "@/store/wizardStore";
import { HelpCircle } from "lucide-react";

import TaskHeader from "./TaskHeader";
import TaskInfo from "./TaskInfo";
import StepsList from "@/pages/steps/StepsList";
import StepAddDialog from "@/pages/steps/StepAddDialog";
import StepEditDialog from "@/pages/steps/StepEditDialog";
import { Button } from "@/components/ui/button";
import StepHelpComponent from "@/pages/steps/details/StepHelpComponent";

export function TaskDetailView() {
  const [isAddingStep, setIsAddingStep] = React.useState(false);
  const [isEditingStep, setIsEditingStep] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Fetch data from stores
  const { tasks, scenarios } = useDataStore();
  const { getTaskSteps } = useStepStore();
  const { activeTaskId } = useWizardStore();
  
  // Get selected task
  const task = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  const steps = activeTaskId ? getTaskSteps(activeTaskId).sort((a, b) => a.order - b.order) : [];

  // Get scenario name for the task
  const scenarioName = task?.scenarioId
    ? scenarios.find((p) => p.id === task.scenarioId)?.title || task.scenarioId
    : "No scenario";

  // If no task is selected, show placeholder
  if (!task) {
    return (
      <div className="h-full">
        <div className="px-6 py-4">
          <h2 className="text-base font-semibold">Task Details</h2>
        </div>
        <div className="flex h-[calc(100vh-240px)] items-center justify-center">
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
    <div className="h-full bg-background">
      {/* Task Header */}
      <TaskHeader 
        task={task} 
      />

      <div className="px-6 py-4">
        <div className="space-y-6">
          {/* Task Info Section */}
          <div className="flex justify-between items-start">
            <TaskInfo 
              description={task.description} 
              scenarioId={task.scenarioId}
              scenarioName={scenarioName} 
            />
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle size={16} />
              {showHelp ? "Hide Guide" : "Workflow Guide"}
            </Button>
          </div>
          
          {/* Help section */}
          {showHelp && (
            <StepHelpComponent />
          )}
          
          {/* Steps List Section */}
          <StepsList 
            steps={steps}
            onAddStep={() => setIsAddingStep(true)}
            onEditStep={handleEditStep}
            taskId={task.id}
          />
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
      {isEditingStep && currentStepIndex !== null && steps[currentStepIndex] && (
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