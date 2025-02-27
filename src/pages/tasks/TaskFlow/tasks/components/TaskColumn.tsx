import React from "react";
import { Plus } from "lucide-react";
import { Status, Task } from "../../types";
import { useTaskFlowStore } from "../../store";
import TaskCard from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TaskColumnProps {
  title: string;
  status: Status;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ title, status }) => {
  const { getTasksByStatus, updateTaskStatus, addTask } = useTaskFlowStore();
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
          <TaskCard key={task.id} task={task} />
        ))}
        
        <Button 
          variant="outline"
          className="w-full mt-2 border-dashed text-sm border-muted-foreground/50"
          onClick={() => {
            // Create a new task with default values
            const newTask: Task = {
              id: `task${Date.now()}`,
              title: "New Task",
              status,
              priority: "medium",
              dueDate: "Mar 20, 2025",
              projectId: "proj1" // Default project
            };
            addTask(newTask);
          }}
        >
          <Plus size={14} className="mr-1" />
          Add Task
        </Button>
      </div>
    </div>
  );
};

export default TaskColumn;