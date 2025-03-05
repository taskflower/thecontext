// src/pages/tasks/components/navigator/TaskItem.tsx
import React from "react";
import {
  MoreHorizontal,
  Edit,
  Trash,
  PlayCircle,
} from "lucide-react";
import { Task } from "@/types";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";
import taskService from "../../services/TaskService";
import { PriorityBadge, StatusIcon } from "@/components/status";


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
          <StatusIcon status={task.status} size={16} />
          <span className="font-medium">{task.title}</span>
        </div>
        <div className="text-xs text-muted-foreground line-clamp-1">
          {task.description || "No description"}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <PriorityBadge priority={task.priority} showLabel={false} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExecuteTask}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Execute Task
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => onEdit(task.id, e)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => onDelete(task.id, e)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}