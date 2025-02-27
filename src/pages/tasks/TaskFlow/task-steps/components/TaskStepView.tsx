// src/pages/tasks/TaskFlow/task-steps/components/TaskStepView.tsx
import React from "react";
import { useTaskStepStore } from "../store";
import TaskList from "./TaskList";
import TaskDetail from "./TaskDetail";
import StepEditor from "./StepEditor";
import { TaskStep } from "../types";
import TaskForm from "./TaskForm";

const TaskStepView: React.FC = () => {
  const { 
    activeTaskId, 
    getTaskById, 
    getStepsByTaskId 
  } = useTaskStepStore();
  
  // Find any form step that needs user input
  const findActiveFormStep = (): TaskStep | null => {
    if (!activeTaskId) return null;
    
    const task = getTaskById(activeTaskId);
    if (!task) return null;
    
    // Get steps in order
    const steps = getStepsByTaskId(activeTaskId)
      .sort((a, b) => a.order - b.order);
    
    // Check if there's a pending form step at current index
    const currentStep = steps[task.currentStepIndex];
    if (
      currentStep && 
      currentStep.schema.type === 'form' && 
      currentStep.status !== 'completed'
    ) {
      return currentStep;
    }
    
    return null;
  };
  
  const activeFormStep = findActiveFormStep();
  
  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r p-4 h-full">
        <TaskList />
      </div>
      
      <div className="flex-1 p-4 h-full">
        {activeFormStep ? (
          <TaskForm step={activeFormStep} />
        ) : (
          <TaskDetail />
        )}
      </div>
      
      {/* Step editor modal */}
      <StepEditor />
    </div>
  );
};

export default TaskStepView;