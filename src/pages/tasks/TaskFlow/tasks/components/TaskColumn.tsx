import React from "react";
import { Status } from "../../types";

import TaskCard from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { useDataStore } from "../../store";


interface TaskColumnProps {
  title: string;
  status: Status;
  onTaskClick?: (taskId: string) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ title, status, onTaskClick }) => {
  const { getTasksByStatus, updateTaskStatus } = useDataStore();
  const tasks = getTasksByStatus(status);
  const count = tasks.length;
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskStatus(taskId, status);
  };
  
  return (
    <div 
      className="w-72 flex-shrink-0"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="bg-secondary rounded-t-lg border border-b-0 px-3 py-2 flex justify-between items-center">
        <div className="font-medium">{title}</div>
        <Badge variant="outline">{count}</Badge>
      </div>
      <div className="bg-secondary/30 rounded-b-lg border p-2 h-full min-h-64">
        {tasks.map((task) => (
          <div key={task.id} onClick={() => onTaskClick && onTaskClick(task.id)}>
            <TaskCard task={task} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;