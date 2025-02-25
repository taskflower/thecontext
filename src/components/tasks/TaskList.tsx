import { ITask } from "@/utils/types";
import { useTaskStore } from "@/store/taskStore";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Edit,
  Trash,
  Plus,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentStore } from "@/store/documentStore";
import { Column } from "../common/ColumnComponent";

interface TaskListProps {
  onSelectTask: (task: ITask) => void;
}

export function TaskList({ onSelectTask }: TaskListProps) {
  // Data from store
  const {
    tasks,
    templates,
    removeTask,
    executeAllTaskSteps,
    isDialogOpen,
    setDialogOpen,
    taskFormData,
    setTaskFormData,
    editingTaskId,
    selectedTaskId,
    setSelectedTask,
    selectedStatusFilter,
    setStatusFilter,
    handleAddTask,
    handleEditTask,
    prepareEditTask,
    resetTaskForm,
  } = useTaskStore();

  const { containers } = useDocumentStore();

  // Derived state
  const filteredTasks = tasks.filter((task) => {
    if (selectedStatusFilter === "all") return true;
    return task.status === selectedStatusFilter;
  });

  // Event handlers
  const handleSelectTask = (task: ITask) => {
    setSelectedTask(task.id);
    onSelectTask(task);
  };

  // UI helpers
  const getStatusIcon = (status: ITask["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "in_progress":
        return <ArrowRight className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getPriorityBadge = (priority: ITask["priority"]) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline">Low</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "high":
        return <Badge variant="destructive">High</Badge>;
    }
  };

  // Add button component for rightActions prop
  const addTaskButton = (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetTaskForm();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingTaskId ? "Edit Task" : "New Task"}</DialogTitle>
          <DialogDescription>
            {editingTaskId
              ? "Edit task details."
              : "Create a new task for document processing."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div>
            <label
              htmlFor="title"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Title
            </label>
            <Input
              id="title"
              value={taskFormData.title}
              onChange={(e) => setTaskFormData({ title: e.target.value })}
              placeholder="Task title"
              className="w-full mt-1"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Description
            </label>
            <Textarea
              id="description"
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ description: e.target.value })}
              placeholder="Task description"
              className="min-h-[100px] mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="priority"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Priority
              </label>
              <Select
                value={taskFormData.priority}
                onValueChange={(value) =>
                  setTaskFormData({
                    priority: value as "low" | "medium" | "high",
                  })
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="container"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Container
              </label>
              <Select
                value={taskFormData.containerId}
                onValueChange={(value) =>
                  setTaskFormData({ containerId: value })
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select container" />
                </SelectTrigger>
                <SelectContent>
                  {containers.map((container) => (
                    <SelectItem key={container.id} value={container.id}>
                      {container.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {!editingTaskId && (
            <div>
              <label
                htmlFor="template"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Template (Optional)
              </label>
              <Select
                value={taskFormData.templateId}
                onValueChange={(value) =>
                  setTaskFormData({ templateId: value })
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Using a template will auto-generate task steps.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={editingTaskId ? handleEditTask : handleAddTask}>
            {editingTaskId ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Empty state for when there are no tasks
  const emptyState = (
    <div className="py-8 text-center text-sm text-muted-foreground">
      No tasks found. Create one to get started.
    </div>
  );

  return (
    <Column
      title="Tasks"
      rightActions={addTaskButton}
      emptyState={filteredTasks.length === 0 ? emptyState : undefined}
    >
      <Tabs
        defaultValue="all"
        className="w-full"
        value={selectedStatusFilter}
        onValueChange={(value) =>
          setStatusFilter(value as typeof selectedStatusFilter)
        }
      >
        <TabsList className="w-full mb-4">
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1">
            Pending
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="flex-1">
            In Progress
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed
          </TabsTrigger>
        </TabsList>
        <div className="space-y-1 px-3">
          {filteredTasks.length > 0 &&
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleSelectTask(task)}
                className={`flex items-center justify-between rounded-md px-3 py-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  selectedTaskId === task.id
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {task.description}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getPriorityBadge(task.priority)}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          executeAllTaskSteps(task.id);
                        }}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Execute Task
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          prepareEditTask(task.id);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTask(task.id);
                          if (selectedTaskId === task.id) {
                            setSelectedTask(null);
                          }
                        }}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
        </div>
      </Tabs>
    </Column>
  );
}
