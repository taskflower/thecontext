// src/pages/tasks/components/navigator/TaskListNavigator.tsx
import { useState } from "react";
import { Button, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Status } from "@/types";
import { useAdminNavigate } from "@/hooks";
import { LayoutGrid, Plus } from "lucide-react";
import { useScenarioStore, useTaskStore, useWizardStore } from "@/store";
import { TaskEditModal, TaskItem } from "..";
import taskService from "../../services/TaskService";

export function TaskListNavigator() {
  // Store data and methods
  const { scenarios } = useScenarioStore();
  const { tasks } = useTaskStore();
  const { activeTaskId, setActiveTask } = useWizardStore();
  const adminNavigate = useAdminNavigate();

  // Local state
  const [selectedStatusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showNoProjectDialog, setShowNoProjectDialog] = useState(false);

  // Filter tasks based on selected status
  const filteredTasks = tasks.filter((task) => {
    if (selectedStatusFilter === "all") return true;
    return task.status === selectedStatusFilter;
  });

  // Event handlers
  const handleSelectTask = (taskId: string) => {
    setActiveTask(taskId);
  };

  const handleEditTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTaskId(taskId);
  };

  // Quick add task with service
  const handleQuickAddTask = () => {
    const result = taskService.createTask();
    
    if (!result.success && result.errorMessage?.includes("project")) {
      setShowNoProjectDialog(true);
    }
  };

  // Handler to navigate to scenarios from dialog
  const handleGoToProjects = () => {
    setShowNoProjectDialog(false);
    adminNavigate("/scenarios");
  };

  // Empty state
  const emptyState = (
    <div className="py-8 text-center text-sm text-muted-foreground">
      No tasks found. Create a new one to get started.
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-base font-semibold">Tasks</h2>

        <div className="flex items-center gap-2">
          {/* Board view button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => adminNavigate("/tasks/board")}
            title="Switch to board view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>

          {/* Quick add task button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleQuickAddTask}
            title={
              scenarios && scenarios.length > 0
                ? "Add new task"
                : "Create a project first"
            }
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        className="w-full px-3 pt-4"
        value={selectedStatusFilter}
        onValueChange={(value) =>
          setStatusFilter(value as typeof selectedStatusFilter)
        }
      >
        <TabsList className="w-full mb-4">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="todo" className="flex-1">
            To do
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex-1">
            In progress
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed
          </TabsTrigger>
        </TabsList>

        <div className="space-y-1 overflow-auto h-[calc(100vh-220px)]">
          {(!scenarios || scenarios.length === 0) ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                You cannot create a task without a project.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adminNavigate("/scenarios")}
              >
                Go to projects
              </Button>
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isActive={activeTaskId === task.id}
                onSelect={handleSelectTask}
                onEdit={handleEditTask}
              />
            ))
          ) : (
            emptyState
          )}
        </div>
      </Tabs>

      {/* Dialog for "No Project" warning */}
      <Dialog open={showNoProjectDialog} onOpenChange={setShowNoProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot create task</DialogTitle>
            <DialogDescription>
              You need to create a project first before you can add tasks.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setShowNoProjectDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleGoToProjects}>Go to projects</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task edit modal */}
      {editingTaskId && (
        <TaskEditModal
          taskId={editingTaskId}
          onClose={() => setEditingTaskId(null)}
        />
      )}
    </div>
  );
}

export default TaskListNavigator;