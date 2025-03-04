// src/pages/tasks/components/navigator/TaskListNavigator.tsx
import { useState } from "react";
import { Button, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useDataStore } from "@/store/dataStore";
import { useWizardStore } from "@/store/wizardStore";
import { Status, Task } from "@/types";
import { useAdminNavigate } from "@/hooks";
import { LayoutGrid, Plus } from "lucide-react";
import { TaskItem } from "./TaskItem";
import { TaskEditModal } from "./TaskEditModal";

export function TaskListNavigator() {
  // Store data and methods
  const { tasks, addTask, scenarios, deleteTask } = useDataStore();
  const { activeTaskId, setActiveTask, openWizard } = useWizardStore();
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

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteTask) {
      deleteTask(taskId);
      if (activeTaskId === taskId) {
        setActiveTask(null);
      }
    }
  };

  const handleEditTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTaskId(taskId);
  };

  const handleExecuteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    openWizard(taskId);
  };

  // Quick add task with scenario validation
  const handleQuickAddTask = () => {
    // Check if there are any scenarios available
    if (scenarios.length === 0) {
      // Show dialog instead of alert
      setShowNoProjectDialog(true);
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: "Nowe zadanie",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
      scenarioId: scenarios[0]?.id || "", // Default to first scenario
      currentStepId: null,
      data: {},
    };

    addTask(newTask);
    setActiveTask(newTask.id);
  };

  // Handler to navigate to scenarios from dialog
  const handleGoToProjects = () => {
    setShowNoProjectDialog(false);
    adminNavigate("/scenarios");
  };

  // Empty state
  const emptyState = (
    <div className="py-8 text-center text-sm text-muted-foreground">
      Nie znaleziono zadań. Utwórz nowe, aby rozpocząć.
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-base font-semibold">Zadania</h2>

        <div className="flex items-center gap-2">
          {/* Board view button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => adminNavigate("/tasks/board")}
            title="Przełącz na widok tablicy"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>

          {/* Quick add task button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleQuickAddTask}
            title={scenarios.length > 0 ? "Dodaj nowe zadanie" : "Najpierw utwórz projekt"}
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
            Wszystkie
          </TabsTrigger>
          <TabsTrigger value="todo" className="flex-1">
            Do zrobienia
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex-1">
            W trakcie
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Ukończone
          </TabsTrigger>
        </TabsList>

        <div className="space-y-1 overflow-auto h-[calc(100vh-220px)]">
          {scenarios.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Nie możesz utworzyć zadania bez projektu.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adminNavigate("/scenarios")}
              >
                Przejdź do projektów
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
                onDelete={handleDeleteTask}
                onExecute={handleExecuteTask}
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
            <DialogTitle>Nie można utworzyć zadania</DialogTitle>
            <DialogDescription>
              Musisz najpierw utworzyć projekt, zanim będziesz mógł dodać zadania.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowNoProjectDialog(false)}>
              Anuluj
            </Button>
            <Button onClick={handleGoToProjects}>
              Przejdź do projektów
            </Button>
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