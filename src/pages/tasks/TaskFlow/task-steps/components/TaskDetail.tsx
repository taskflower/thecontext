/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/task-steps/components/TaskDetail.tsx
import React from "react";
import { Play, Plus, Code } from "lucide-react";
import { useTaskStepStore } from "../store";
import StepCard from "./StepCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TaskDetail: React.FC = () => {
  const { 
    activeTaskId, 
    getTaskById, 
    getStepsByTaskId, 
    toggleStepEditor, 
    setEditingStep, 
    runTask 
  } = useTaskStepStore();

  // If no active task, render nothing
  if (!activeTaskId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a task to view details
      </div>
    );
  }

  const task = getTaskById(activeTaskId);
  if (!task) return null;

  const steps = getStepsByTaskId(activeTaskId);
  
  const statusColor = {
    draft: "secondary",
    active: "warning",
    completed: "success",
    error: "destructive"
  }[task.status];

  const handleAddStep = () => {
    setEditingStep(null);
    toggleStepEditor();
  };

  const handleRunTask = () => {
    runTask(activeTaskId);
  };

  return (
    <div className="h-full flex flex-col">
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{task.title}</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                {task.description}
              </div>
            </div>
            <Badge variant={statusColor as any}>{task.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="text-muted-foreground">Project: </span>
              <span className="font-medium">{task.projectId}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleRunTask} disabled={task.status === 'completed'}>
                <Play size={14} className="mr-1" />
                Run Task
              </Button>
              <Button size="sm" variant="outline" onClick={handleAddStep}>
                <Plus size={14} className="mr-1" />
                Add Step
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Task Steps</h3>
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <Code size={14} />
            <span>View Task Scope</span>
          </Button>
        </div>

        {steps.length === 0 ? (
          <div className="text-center p-8 border rounded-md text-muted-foreground">
            <div className="mb-2">No steps defined for this task</div>
            <Button size="sm" onClick={handleAddStep}>
              <Plus size={14} className="mr-1" />
              Add First Step
            </Button>
          </div>
        ) : (
          steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              isFirst={index === 0}
              isLast={index === steps.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TaskDetail;