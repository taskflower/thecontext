// src/pages/tasks/components/kanban/TasksBoardView.tsx
import React from "react";
import { List } from "lucide-react";

import { Button } from "@/components/ui/button"; 
import TaskColumn from "./TaskColumn";
import NewTaskModal from "../NewTaskModal";
import StepWizard from "../../../steps/components/StepWizard";
import { useUIStore } from "../../../../store";
import { useAdminNavigate } from "@/hooks";

const TasksBoardView: React.FC = () => {
  const { connectTaskWithSteps } = useUIStore();
  const adminNavigate = useAdminNavigate();
  
  const handleTaskClick = (taskId: string) => {
    // Connect the task with steps system and open the wizard
    connectTaskWithSteps(taskId);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h2 className="text-base font-semibold">Task Board</h2>
        
        {/* Simple list view button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => adminNavigate('/tasks/navigator')}
          title="Switch to List View"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Task Boards</h3>
          <NewTaskModal />
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4">
          <TaskColumn title="To Do" status="todo" onTaskClick={handleTaskClick} />
          <TaskColumn title="In Progress" status="in-progress" onTaskClick={handleTaskClick} />
          <TaskColumn title="Under Review" status="review" onTaskClick={handleTaskClick} />
          <TaskColumn title="Completed" status="completed" onTaskClick={handleTaskClick} />
        </div>
      </div>
      
      {/* Include the StepWizard component */}
      <StepWizard />
    </div>
  );
};

export default TasksBoardView;