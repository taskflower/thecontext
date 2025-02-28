/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/tasks/components/navigator/TaskDetailView.tsx
import React from "react";
import { PlayCircle, Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataStore, useUIStore } from "../../../store";

export function TaskDetailView() {
  const [isAddingStep, setIsAddingStep] = React.useState(false);
  const [newStepDescription, setNewStepDescription] = React.useState('');
  const [newStepType, setNewStepType] = React.useState('form');

  // Get data from store
  const { tasks, getTaskSteps, addStep, projects } = useDataStore();
  const { activeTaskId, connectTaskWithSteps } = useUIStore();
  
  // Get the selected task
  const task = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;
  const steps = activeTaskId ? getTaskSteps(activeTaskId) : [];
  
  // Get project name for the task
  const projectName = task?.projectId ? 
    projects.find(p => p.id === task.projectId)?.title || task.projectId : 
    "No project";

  if (!task) {
    return (
      <div className="h-full">
        <div className="px-6 py-4">
          <h2 className="text-base font-semibold">Task Detail</h2>
        </div>
        <div className="flex h-[calc(100vh-240px)] items-center justify-center">
          <p className="text-sm text-muted-foreground">Select a task to view details</p>
        </div>
      </div>
    );
  }

  const handleAddStep = () => {
    if (!newStepDescription.trim()) return;
    
    addStep({
      id: `step-${task.id}-${steps.length + 1}`,
      taskId: task.id,
      title: newStepDescription,
      description: newStepDescription,
      type: newStepType as any,
      status: "pending",
      order: steps.length + 1,
      config: {},
      options: {},
      result: null
    });
    
    setNewStepDescription('');
    setIsAddingStep(false);
  };
  
  const handleExecuteAllSteps = () => {
    if (task) {
      connectTaskWithSteps(task.id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in-progress':
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'completed':
        return <Badge>Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="h-full bg-background">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mt-2">{task.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
          </div>
          <Button onClick={handleExecuteAllSteps}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Execute All Steps
          </Button>
        </div>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            {task.description || 'No description provided.'}
          </p>
          
          {task.projectId && (
            <div>
              <div className="flex items-center gap-2 text-sm">
                <Folder className="h-4 w-4" />
                Project: {projectName}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Steps</h3>
              <Button variant="outline" size="sm" onClick={() => setIsAddingStep(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-3">
                {steps.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground border rounded-md">
                    No steps defined. Add steps to execute this task.
                  </div>
                ) : (
                  steps.map((step, index) => (
                    <div key={step.id} className="overflow-hidden border rounded-md">
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
                              onClick={() => {
                                // Execute this specific step
                                if (task) {
                                  connectTaskWithSteps(task.id);
                                }
                              }}
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {step.result && (
                        <div className="px-4 py-3 bg-muted/50 border-t">
                          <div className="text-sm font-mono">
                            {typeof step.result === 'object' 
                              ? JSON.stringify(step.result) 
                              : String(step.result)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <Dialog open={isAddingStep} onOpenChange={setIsAddingStep}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task Step</DialogTitle>
            <DialogDescription>Create a new step for this task.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="step-type" className="text-sm font-medium mb-1 block">
                Step Type
              </label>
              <Select
                value={newStepType}
                onValueChange={(value) => setNewStepType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form">Form</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="data">Data Processing</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="step-description" className="text-sm font-medium mb-1 block">
                Description
              </label>
              <Input
                id="step-description"
                value={newStepDescription}
                onChange={(e) => setNewStepDescription(e.target.value)}
                placeholder="Step description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingStep(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStep}>Add Step</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TaskDetailView;