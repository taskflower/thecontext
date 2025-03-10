/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/plugins/PreviousStepsSelect/index.tsx
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStepStore } from '@/store/stepStore';

// Define the component props
export interface PreviousStepsSelectProps {
  stepId: string;
  taskId?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

/**
 * A component that allows selecting a previous step from the current task flow
 */
export function PreviousStepsSelect({
  stepId,
  taskId,
  value,
  onChange,
  label = "Referenced Step",
  placeholder = "Select a step",
  required = false
}: PreviousStepsSelectProps) {
  const [availableSteps, setAvailableSteps] = useState<Array<{id: string, title: string, status: string}>>([]);
  const [error, setError] = useState<string | null>(null);

  // Get all steps available in the current task
  useEffect(() => {
    if (!taskId) return;
    
    const stepStore = useStepStore.getState();
    const taskSteps = stepStore.getTaskSteps(taskId);
    
    if (!taskSteps || taskSteps.length === 0) return;
    
    // Sort steps by order
    const sortedSteps = [...taskSteps].sort((a, b) => a.order - b.order);
    
    // Find the current step index
    const currentStepIndex = sortedSteps.findIndex(s => s.id === stepId);
    
    // Filter out steps that come after the current step and the current step itself
    const previousSteps = sortedSteps
      .slice(0, currentStepIndex)
      .map(s => ({ 
        id: s.id, 
        title: s.title || `Step ${s.order}`,
        status: s.status
      }));
    
    setAvailableSteps(previousSteps);
    
    // Clear error if we have available steps or if value is empty and not required
    if (previousSteps.length > 0 || (!value && !required)) {
      setError(null);
    } else if (required && previousSteps.length === 0) {
      setError("No previous steps available to reference");
    }
  }, [taskId, stepId, required, value]);

  // Validate the current selection when value changes
  useEffect(() => {
    if (!required || !value) {
      setError(null);
      return;
    }

    // Check if the selected step exists and has a result
    if (value && value !== 'no-steps-available') {
      const stepStore = useStepStore.getState();
      const referencedStep = stepStore.getStepById(value);
      
      if (!referencedStep) {
        setError("The referenced step no longer exists");
      } else if (referencedStep.status !== 'completed') {
        setError("The referenced step has not been completed yet");
      } else if (!referencedStep.result) {
        setError("The referenced step has no result data yet");
      } else {
        setError(null);
      }
    }
  }, [value, required]);

  return (
    <div className="grid gap-2">
      <Label htmlFor="previousStep">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select 
        value={value} 
        onValueChange={(newValue) => {
          onChange(newValue);
          
          // Re-validate on change
          if (required && !newValue) {
            setError("Please select a step to reference");
          } else {
            setError(null);
          }
        }}
      >
        <SelectTrigger id="previousStep" className={error ? "border-destructive" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {availableSteps.length > 0 ? (
            availableSteps.map((availableStep) => (
              <SelectItem 
                key={availableStep.id} 
                value={availableStep.id}
                disabled={availableStep.status !== 'completed'}
              >
                {availableStep.title}
                {availableStep.status !== 'completed' && " (not completed)"}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-steps-available" disabled>
              No previous steps available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : availableSteps.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          This must be the first step. Add this step after other steps to reference them.
        </p>
      ) : null}
    </div>
  );
}

// Export validation function for use in plugins
export function validateStepReference(stepId: string, required = true): { 
  isValid: boolean; 
  errorMessage?: string 
} {
  if (!stepId && !required) {
    return { isValid: true };
  }
  
  if (!stepId && required) {
    return { 
      isValid: false, 
      errorMessage: "Please select a step to reference" 
    };
  }
  
  const stepStore = useStepStore.getState();
  const referencedStep = stepStore.getStepById(stepId);
  
  if (!referencedStep) {
    return { 
      isValid: false, 
      errorMessage: "The referenced step no longer exists" 
    };
  }
  
  if (referencedStep.status !== 'completed') {
    return { 
      isValid: false, 
      errorMessage: "The referenced step has not been completed yet" 
    };
  }
  
  if (!referencedStep.result) {
    return { 
      isValid: false, 
      errorMessage: "The referenced step has no result data yet" 
    };
  }
  
  return { isValid: true };
}

// Export helper function to get data from a step
export function getStepData(stepId: string): {
  data: any | null;
  title: string;
  error?: string;
} {
  if (!stepId) {
    return { 
      data: null, 
      title: "", 
      error: "No step ID provided" 
    };
  }
  
  const stepStore = useStepStore.getState();
  const step = stepStore.getStepById(stepId);
  
  if (!step) {
    return { 
      data: null, 
      title: "", 
      error: "Step not found" 
    };
  }
  
  if (step.status !== 'completed') {
    return { 
      data: null, 
      title: step.title || `Step ${step.order}`, 
      error: "Step not completed" 
    };
  }
  
  if (!step.result) {
    return { 
      data: null, 
      title: step.title || `Step ${step.order}`, 
      error: "No result data available" 
    };
  }
  
  return {
    data: step.result,
    title: step.title || `Step ${step.order}`
  };
}