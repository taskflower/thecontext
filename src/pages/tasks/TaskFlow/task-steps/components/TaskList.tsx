/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/task-steps/components/TaskList.tsx
import React from "react";
import { Plus, Play } from "lucide-react";
import { useTaskStepStore } from "../store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TaskList: React.FC = () => {
  const { 
    tasks, 
    activeTaskId, 
    setActiveTask, 
    createTask,
    runTask,
    getStepsByTaskId 
  } = useTaskStepStore();

  const handleCreateTask = () => {
    const taskName = prompt("Enter task name:");
    if (taskName) {
      createTask({
        title: taskName,
        description: "",
        projectId: "default-project"
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium">Tasks</h3>
        <Button 
          size="sm" 
          onClick={handleCreateTask}
        >
          <Plus size={14} className="mr-1" />
          New Task
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        {tasks.length === 0 ? (
          <div className="text-center p-8 border rounded-md text-muted-foreground">
            <div className="mb-2">No tasks created yet</div>
            <Button size="sm" onClick={handleCreateTask}>
              <Plus size={14} className="mr-1" />
              Create First Task
            </Button>
          </div>
        ) : (
          <div className="grid gap-2">
            {tasks.map((task) => {
              const stepCount = getStepsByTaskId(task.id).length;
              
              const statusColor = {
                draft: "secondary",
                active: "warning",
                completed: "success",
                error: "destructive"
              }[task.status];
              
              return (
                <div 
                  key={task.id} 
                  className={`p-3 border rounded-md cursor-pointer ${
                    task.id === activeTaskId ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setActiveTask(task.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">{task.title}</div>
                    <Badge variant={statusColor as any}>{task.status}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {stepCount} steps • {task.currentStepIndex + 1 > stepCount 
                        ? stepCount 
                        : task.currentStepIndex + 1} current
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        runTask(task.id);
                      }}
                      disabled={task.status === 'completed' || stepCount === 0}
                    >
                      <Play size={12} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;