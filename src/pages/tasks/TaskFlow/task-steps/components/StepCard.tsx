/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/task-steps/components/StepCard.tsx
import React from "react";
import { ChevronDown, ChevronUp, Play, Edit, Trash } from "lucide-react";
import { TaskStep } from "../types";
import { useTaskStepStore } from "../store";
import StepTypeIcon from "./StepTypeIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface StepCardProps {
  step: TaskStep;
  isFirst: boolean;
  isLast: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ 
  step, 
  isFirst, 
  isLast 
}) => {
  const { 
    updateStep, 
    reorderSteps, 
    deleteStep, 
    executeStep, 
    setEditingStep,
    toggleStepEditor
  } = useTaskStepStore();
  
  const statusColor = {
    pending: "secondary",
    running: "warning",
    completed: "success",
    error: "destructive"
  }[step.status];
  
  const handleMoveUp = () => {
    const { taskId, id, order } = step;
    const steps = useTaskStepStore.getState().getStepsByTaskId(taskId);
    
    const stepIds = steps.map(s => s.id);
    const currentIndex = stepIds.indexOf(id);
    
    if (currentIndex > 0) {
      [stepIds[currentIndex], stepIds[currentIndex - 1]] = 
        [stepIds[currentIndex - 1], stepIds[currentIndex]];
      
      reorderSteps(taskId, stepIds);
    }
  };
  
  const handleMoveDown = () => {
    const { taskId, id, order } = step;
    const steps = useTaskStepStore.getState().getStepsByTaskId(taskId);
    
    const stepIds = steps.map(s => s.id);
    const currentIndex = stepIds.indexOf(id);
    
    if (currentIndex < stepIds.length - 1) {
      [stepIds[currentIndex], stepIds[currentIndex + 1]] = 
        [stepIds[currentIndex + 1], stepIds[currentIndex]];
      
      reorderSteps(taskId, stepIds);
    }
  };
  
  const handleEdit = () => {
    setEditingStep(step);
    toggleStepEditor();
  };
  
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this step?")) {
      deleteStep(step.id);
    }
  };
  
  const handleExecute = () => {
    executeStep(step.id);
  };
  
  return (
    <Card className="mb-3">
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
              <StepTypeIcon type={step.schema.type} size={12} />
            </div>
            <div>
              <div className="font-medium">{step.schema.title}</div>
              {step.schema.description && (
                <div className="text-xs text-muted-foreground">{step.schema.description}</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Badge variant={statusColor as any}>{step.status}</Badge>
            <Button variant="ghost" size="icon" onClick={handleExecute} disabled={step.status === 'running'}>
              <Play size={14} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleEdit}>
              <Edit size={14} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete}>
              <Trash size={14} />
            </Button>
            <div className="flex flex-col">
              <Button variant="ghost" size="icon" onClick={handleMoveUp} disabled={isFirst} className="h-4 w-4">
                <ChevronUp size={14} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleMoveDown} disabled={isLast} className="h-4 w-4">
                <ChevronDown size={14} />
              </Button>
            </div>
          </div>
        </div>
        
        {(step.input || step.output || step.error) && (
          <div className="mt-3 text-sm">
            {step.input && (
              <div className="mt-2">
                <div className="font-semibold text-xs">Input:</div>
                <pre className="text-xs bg-secondary/50 p-2 rounded overflow-auto max-h-20">
                  {JSON.stringify(step.input, null, 2)}
                </pre>
              </div>
            )}
            
            {step.output && (
              <div className="mt-2">
                <div className="font-semibold text-xs">Output:</div>
                <pre className="text-xs bg-secondary/50 p-2 rounded overflow-auto max-h-20">
                  {JSON.stringify(step.output, null, 2)}
                </pre>
              </div>
            )}
            
            {step.error && (
              <div className="mt-2">
                <div className="font-semibold text-xs text-destructive">Error:</div>
                <pre className="text-xs bg-destructive/10 text-destructive p-2 rounded overflow-auto max-h-20">
                  {step.error}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StepCard;