// src/pages/tasks/components/navigator/TaskItem.tsx
import React from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Edit,
  Trash,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import { Task } from "@/types";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import taskService from "../../services/TaskService";

interface TaskItemProps {
  task: Task;
  isActive: boolean;
  onSelect: (taskId: string) => void;
  onEdit: (taskId: string, e: React.MouseEvent) => void;
  onDelete: (taskId: string, e: React.MouseEvent) => void;
  onExecute: (taskId: string, e: React.MouseEvent) => void;
}

export function TaskItem({
  task,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}: TaskItemProps) {
  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "todo":
      case "pending":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case "in-progress":
      case "in_progress":
        return <ArrowRight className="h-4 w-4 text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
      case "review":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline">Niski</Badge>;
      case "medium":
        return <Badge variant="secondary">Średni</Badge>;
      case "high":
        return <Badge variant="destructive">Wysoki</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Handler for execute task action in dropdown
  const handleExecuteTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    taskService.executeTask(task.id);
  };

  return (
    <div
      onClick={() => onSelect(task.id)}
      className={`flex items-center justify-between rounded-md px-3 py-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${
        isActive ? "bg-accent text-accent-foreground" : ""
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {getStatusIcon(task.status)}
          <span className="font-medium">{task.title}</span>
        </div>
        <div className="text-xs text-muted-foreground line-clamp-1">
          {task.description || "Brak opisu"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {getPriorityBadge(task.priority)}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Więcej opcji</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExecuteTask}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Wykonaj zadanie
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => onEdit(task.id, e)}>
              <Edit className="mr-2 h-4 w-4" />
              Edytuj
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => onDelete(task.id, e)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Usuń
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
