// src/pages/tasks/components/NewTaskModal.tsx
import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useDataStore } from "@/store";
import { Step, StepType, Task } from "@/types";
import { StepEditor, getAllPlugins, getDefaultConfig } from "@/pages/stepsPlugins";

const NewTaskModal = () => {
  const { addTask, projects, addStep } = useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    projectId: projects[0]?.id || "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: new Date().toISOString().split("T")[0],
  });

  // State for steps
  const [steps, setSteps] = useState<Step[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setTaskData({ ...taskData, [field]: value });
  };

  const toggleModal = () => {
    setShowModal(!showModal);

    // Reset form when reopening
    if (!showModal) {
      setTaskData({
        title: "",
        description: "",
        projectId: projects[0]?.id || "",
        priority: "medium",
        dueDate: new Date().toISOString().split("T")[0],
      });

      // Reset steps
      setSteps([]);
    }
  };

  // Add a new step
  const handleAddStep = () => {
    const plugins = getAllPlugins();
    const defaultType = plugins.length > 0 ? plugins[0].type : 'form';
    const defaultConfig = getDefaultConfig(defaultType);
    
    const newStep: Step = {
      id: `temp-${Date.now()}-${steps.length + 1}`,
      taskId: "temp",
      title: `Step ${steps.length + 1}`,
      description: "Step description",
      type: defaultType as StepType,
      status: "pending",
      order: steps.length + 1,
      config: defaultConfig,
      options: {},
      result: null
    };
    
    setSteps([...steps, newStep]);
  };

  // Update a step
  const handleUpdateStep = (index: number, updates: Partial<Step>) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = { ...updatedSteps[index], ...updates };
    setSteps(updatedSteps);
  };

  // Remove a step
  const handleRemoveStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    // Update order numbers
    updatedSteps.forEach((step, i) => {
      step.order = i + 1;
    });
    setSteps(updatedSteps);
  };

  const handleSubmit = () => {
    if (!taskData.title.trim()) return;

    // Create the new task
    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
      id: newTaskId,
      title: taskData.title,
      description: taskData.description,
      status: "todo",
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      projectId: taskData.projectId,
      currentStepId: null,
      data: {},
    };

    // Add task to store
    addTask(newTask);

    // Add steps for the task
    steps.forEach(step => {
      const newStepId = `step-${newTaskId}-${step.order}`;
      addStep({
        ...step,
        id: newStepId,
        taskId: newTaskId
      });
    });

    toggleModal();
  };

  return (
    <>
      <Button onClick={toggleModal} className="mb-4">
        <Plus size={16} className="mr-2" />
        Add New Task
      </Button>

      <Dialog open={showModal} onOpenChange={toggleModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Task Details</TabsTrigger>
              <TabsTrigger value="steps">Steps ({steps.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={taskData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    className="h-20"
                    value={taskData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="project">Project</Label>
                    <Select
                      value={taskData.projectId}
                      onValueChange={(value) =>
                        handleInputChange("projectId", value)
                      }
                    >
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={taskData.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        handleInputChange("priority", value)
                      }
                    >
                      <SelectTrigger id="priority">
                        <SelectValue placeholder="Set priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={taskData.dueDate}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value)
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="steps">
              <div className="mb-4 flex justify-end">
                <Button onClick={handleAddStep} size="sm" variant="outline">
                  <Plus size={14} className="mr-1" />
                  Add Step
                </Button>
              </div>
              
              {steps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No steps defined. Click "Add Step" to create a step for this task.
                </div>
              ) : (
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <Card key={step.id} className="border">
                      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0">
                        <div className="font-medium">Step {index + 1}: {step.title}</div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveStep(index)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </CardHeader>
                      <CardContent className="px-4 py-3">
                        <StepEditor 
                          step={step} 
                          onChange={(updates) => handleUpdateStep(index, updates)} 
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" asChild>
              <DialogClose>Cancel</DialogClose>
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!taskData.title.trim()}
            >
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewTaskModal;