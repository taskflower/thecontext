// src/pages/tasks/TaskFlow/tasks/components/NewTaskModal.tsx
import React, { useState } from "react";
import { Plus } from "lucide-react";
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

import { useStepsForm } from "../../steps/useStepsForm";
import StepsList from "../../steps/components/StepsList";
import { useDataStore } from "@/store";
import { Task } from "@/types";


// Import modular components

const NewTaskModal: React.FC = () => {
  const { addTask, projects } = useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    projectId: projects[0]?.id || "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: new Date().toISOString().split("T")[0],
  });

  // Use the steps hook
  const {
    steps,
    addStep,
    handleStepsSubmit,
    resetSteps,
    updateStep,
    removeStep,
    moveStep,
  } = useStepsForm();

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
      resetSteps();
    }
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

    // Process and add steps for the task
    handleStepsSubmit(newTaskId);

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
              <StepsList
                steps={steps}
                onAddStep={addStep}
                onUpdateStep={updateStep}
                onRemoveStep={removeStep}
                onMoveStep={moveStep}
              />
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
