// src/pages/tasks/components/navigator/TaskListNavigator.tsx
import React, { useState } from "react";
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
  LayoutGrid,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui";
import { useDataStore, useUIStore } from "@/store";
import { Status, Task } from "@/types";
import { useAdminNavigate } from "@/hooks";

export function TaskListNavigator() {
  // Get data and methods from stores
  const { tasks, addTask, projects, deleteTask } = useDataStore();
  const { connectTaskWithSteps, activeTaskId, setActiveTask } = useUIStore();
  const adminNavigate = useAdminNavigate();
  
  // Local state for selected filter
  const [selectedStatusFilter, setStatusFilter] = useState<Status | 'all'>('all');

  // Filter tasks based on selected status
  const filteredTasks = tasks.filter((task) => {
    if (selectedStatusFilter === "all") return true;
    return task.status === selectedStatusFilter;
  });

  // Event handlers
  const handleSelectTask = (taskId: string) => {
    // Set active task in UI store to trigger rendering of task details
    setActiveTask(taskId);
  };

  // Delete task handler
  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteTask) {
      deleteTask(taskId);
      if (activeTaskId === taskId) {
        setActiveTask(null);
      }
    }
  };

  // Edit task handler
  const handleEditTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // You could open a modal for editing here
    console.log("Edit task:", taskId);
  };

  // Execute task handler
  const handleExecuteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    connectTaskWithSteps(taskId);
  };

  // Quick add task functionality
  const handleQuickAddTask = () => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: "New Task",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
      projectId: projects[0]?.id || "",
      currentStepId: null,
      data: {},
    };
    
    addTask(newTask);
    
    // Automatically select the new task
    setActiveTask(newTask.id);
  };

  // UI helpers
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
        return <Badge variant="outline">Low</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "high":
        return <Badge variant="destructive">High</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  // Empty state for when there are no tasks
  const emptyState = (
    <div className="py-8 text-center text-sm text-muted-foreground">
      No tasks found. Create one to get started.
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h2 className="text-base font-semibold">Tasks</h2>
        
        <div className="flex items-center gap-2">
          {/* Simple board view button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => adminNavigate('/tasks/board')}
            title="Switch to Board View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          
          {/* Quick add task button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleQuickAddTask}
            title="Add New Task"
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
            To Do
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex-1">
            In Progress
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Completed
          </TabsTrigger>
        </TabsList>
        
        <div className="space-y-1 overflow-auto h-[calc(100vh-220px)]">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleSelectTask(task.id)}
                className={`flex items-center justify-between rounded-md px-3 py-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                  activeTaskId === task.id
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
                    {task.description || "No description"}
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
                        onClick={(e) => handleExecuteTask(task.id, e)}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Execute Task
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => handleEditTask(task.id, e)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => handleDeleteTask(task.id, e)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            emptyState
          )}
        </div>
      </Tabs>
    </div>
  );
}

export default TaskListNavigator;