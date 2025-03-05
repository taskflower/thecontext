// src/components/plugins/PreviousStepsSelect.tsx
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStepStore } from '@/store/stepStore';

interface PreviousStepsSelectProps {
  stepId: string;
  taskId?: string; 
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function PreviousStepsSelect({ 
  stepId,
  taskId,
  value,
  onChange,
  label = "Referenced Step",
  placeholder = "Select a step"
}: PreviousStepsSelectProps) {
  const [availableSteps, setAvailableSteps] = useState<Array<{id: string, title: string}>>([]);
  
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
      .map(s => ({ id: s.id, title: s.title || `Step ${s.order}` }));
    
    setAvailableSteps(previousSteps);
  }, [taskId, stepId]);

  return (
    <div className="grid gap-2">
      <Label htmlFor="previousStep">{label}</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
      >
        <SelectTrigger id="previousStep">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {availableSteps.length > 0 ? (
            availableSteps.map((availableStep) => (
              <SelectItem key={availableStep.id} value={availableStep.id}>
                {availableStep.title}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-steps-available" disabled>
              No previous steps available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {availableSteps.length === 0 && (
        <p className="text-xs text-muted-foreground">
          This must be the first step. Add this step after other steps to reference them.
        </p>
      )}
    </div>
  );
}