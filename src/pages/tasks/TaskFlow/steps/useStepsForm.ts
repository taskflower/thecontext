/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/steps/useStepsForm.ts
import { useState } from "react";
import { Step, StepType } from "../types";

import { getPluginDefaultConfig, getPluginDefaultOptions } from "../stepsPlugins/registry";
import { useDataStore } from "../store";

// Interface for step form data
export interface StepFormData {
  id: string;
  title: string;
  description: string;
  type: StepType;
  order: number;
  config: Record<string, any>;
  options: Record<string, any>;
}

export function useStepsForm() {
  const { addStep } = useDataStore();
  
  // Steps state
  const [steps, setSteps] = useState<StepFormData[]>([createDefaultStep()]);
  
  // Helper to create a default step
  function createDefaultStep(order = 1): StepFormData {
    const defaultType = "form" as StepType;
    return {
      id: `temp-${Date.now()}-${order}`,
      title: `Step ${order}`,
      description: "Step description",
      type: defaultType,
      order,
      config: getPluginDefaultConfig(defaultType),
      options: getPluginDefaultOptions(defaultType),
    };
  }
  
  // Add a new step
  const addStepToForm = () => {
    const newOrder = steps.length + 1;
    setSteps([...steps, createDefaultStep(newOrder)]);
  };
  
  // Update a step
  const updateStep = (index: number, updates: Partial<StepFormData>) => {
    const updatedSteps = [...steps];
    
    // Handle type change - create entirely new config and options objects
    if (updates.type && updates.type !== updatedSteps[index].type) {
      // Get default config and options for the new type
      const newConfig = getPluginDefaultConfig(updates.type);
      const newOptions = getPluginDefaultOptions(updates.type);
      
      // Preserve title and description from existing config if they exist
      if (updatedSteps[index].config && updatedSteps[index].config.title) {
        newConfig.title = updatedSteps[index].config.title;
      }
      
      if (updatedSteps[index].config && updatedSteps[index].config.description) {
        newConfig.description = updatedSteps[index].config.description;
      }
      
      updates.config = newConfig;
      updates.options = newOptions;
    }
    
    // Handle config updates specifically
    if (updates.config && !updates.type) {
      updates.config = {
        ...updatedSteps[index].config,
        ...updates.config
      };
    }
    
    // Handle options updates specifically
    if (updates.options && !updates.type) {
      updates.options = {
        ...updatedSteps[index].options,
        ...updates.options
      };
    }
    
    updatedSteps[index] = { ...updatedSteps[index], ...updates };
    setSteps(updatedSteps);
  };
  
  // Remove a step
  const removeStep = (index: number) => {
    if (steps.length <= 1) return; // Keep at least one step
    
    const updatedSteps = steps.filter((_, i) => i !== index);
    
    // Update order numbers
    updatedSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    
    setSteps(updatedSteps);
  };
  
  // Move a step
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === steps.length - 1)
    ) {
      return;
    }
    
    const updatedSteps = [...steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap steps
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    
    // Update order numbers
    updatedSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    
    setSteps(updatedSteps);
  };
  
  // Handle form submission
  const handleStepsSubmit = (taskId: string) => {
    // Add steps to the store
    steps.forEach((stepData) => {
      const newStepId = `step-${taskId}-${stepData.order}`;
      
      // Create step object for storage
      const newStep: Step = {
        id: newStepId,
        taskId,
        title: stepData.title,
        description: stepData.description,
        type: stepData.type,
        status: "pending",
        order: stepData.order,
        config: stepData.config,
        options: stepData.options,
        result: null
      };
      
      addStep(newStep);
    });
  };
  
  // Reset steps
  const resetSteps = () => {
    setSteps([createDefaultStep()]);
  };
  
  return {
    steps,
    addStep: addStepToForm,
    updateStep,
    removeStep,
    moveStep,
    handleStepsSubmit,
    resetSteps
  };
}