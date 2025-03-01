// src/pages/tasks/components/navigator/TaskDetailView.tsx
import React from "react";
import { useDataStore } from "@/store/dataStore";
import { useStepStore } from "@/store/stepStore";
import { useWizardStore } from "@/store/wizardStore";

import TaskHeader from "./TaskHeader";
import TaskInfo from "./TaskInfo";
import StepsList from "@/pages/steps/StepsList";
import StepAddDialog from "@/pages/steps/StepAddDialog";
import StepEditDialog from "@/pages/steps/StepEditDialog";


export function TaskDetailView() {
  const [isAddingStep, setIsAddingStep] = React.useState(false);
  const [isEditingStep, setIsEditingStep] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState<number | null>(null);

  // Fetch data from stores
  const { tasks, projects } = useDataStore();
  const { getTaskSteps } = useStepStore();
  const { activeTaskId } = useWizardStore();
  
  // Get selected task
  const task = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  const steps = activeTaskId ? getTaskSteps(activeTaskId).sort((a, b) => a.order - b.order) : [];

  // Get project name for the task
  const projectName = task?.projectId
    ? projects.find((p) => p.id === task.projectId)?.title || task.projectId
    : "Brak projektu";

  // If no task is selected, show placeholder
  if (!task) {
    return (
      <div className="h-full">
        <div className="px-6 py-4">
          <h2 className="text-base font-semibold">Szczegóły zadania</h2>
        </div>
        <div className="flex h-[calc(100vh-240px)] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Wybierz zadanie, aby zobaczyć szczegóły
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
          <TaskInfo 
            description={task.description} 
            projectId={task.projectId}
            projectName={projectName} 
          />

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