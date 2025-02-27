import React from "react";
import { Task } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  // Map priority to badge variant
  const priorityVariant: Record<string, string> = {
    low: "success",
    medium: "warning",
    high: "destructive"
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("taskId", task.id);
  };
  
  return (
    <Card 
      className="mb-2 shadow-sm cursor-pointer"
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-3">
        <div className="font-medium text-sm mb-2">{task.title}</div>
        <div className="flex justify-between items-center">
          <Badge variant={priorityVariant[task.priority]}>
            {task.priority}
          </Badge>
          <span className="text-xs text-muted-foreground">{task.dueDate}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;