import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDataStore } from "@/store";
import { Task } from "@/types";



const TaskboardPanel: React.FC = () => {
  const { addTask, projects } = useDataStore();
  const [taskTitle, setTaskTitle] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [priority, setPriority] = useState("medium");

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      description: "", // Added empty description
      status: "todo", // Always add to "To Do"
      priority: priority as "low" | "medium" | "high",
      dueDate: new Date().toISOString().split("T")[0], // ISO format for date
      projectId: projectId,
      currentStepId: null,
      data: {},
    };
    
    addTask(newTask);
    setTaskTitle(""); // Reset input field
  };

  return (
    <div className="bg-card border rounded-lg p-4 mb-6 shadow-sm">
      <h3 className="text-lg font-medium mb-3">Add New Task</h3>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            placeholder="Task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          />
        </div>
        
        <div className="w-36">
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-48">
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button onClick={handleAddTask} disabled={!taskTitle.trim()}>
          <Plus size={16} className="mr-1" />
          Add Task
        </Button>
      </div>
    </div>
  );
};

export default TaskboardPanel;