// src/pages/tasks/TaskFlow/tasks/components/TaskCard.tsx
import React from "react";
import { Task } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { CheckCircle2, CircleDashed } from "lucide-react";
import { useDataStore } from "../../store";


interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  // Map priority to badge variant
  const priorityVariant: Record<string, "default" | "secondary" | "destructive"> = {
    low: "default",
    medium: "secondary",
    high: "destructive"
  };
  
  const { getTaskSteps } = useDataStore();
  const steps = getTaskSteps(task.id);
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  
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
        
        {totalSteps > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <div className="flex items-center">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div key={index} className="mr-0.5">
                  {index < completedSteps ? (
                    <CheckCircle2 size={12} className="text-primary" />
                  ) : (
                    <CircleDashed size={12} />
                  )}
                </div>
              ))}
            </div>
            <span>{completedSteps}/{totalSteps} steps</span>
          </div>
        )}
        
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