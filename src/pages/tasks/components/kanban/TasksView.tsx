// src/pages/tasks/TaskFlow/tasks/components/TasksView.tsx
import React from "react";
import TaskColumn from "./TaskColumn";
import NewTaskModal from "../NewTaskModal";
import StepWizard from "../../../steps/components/StepWizard";
import { useUIStore } from "../../../../../../store";



const TasksView: React.FC = () => {
  const { connectTaskWithSteps } = useUIStore();
  
  const handleTaskClick = (taskId: string) => {
    // Connect the task with steps system and open the wizard
    connectTaskWithSteps(taskId);
  };
  
  return (
    <div className="p-6 flex-1 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Task Board</h3>
        <NewTaskModal />
      </div>
      
      <div className="flex gap-4 h-full">
        <TaskColumn title="To Do" status="todo" onTaskClick={handleTaskClick} />
        <TaskColumn title="In Progress" status="in-progress" onTaskClick={handleTaskClick} />
        <TaskColumn title="Under Review" status="review" onTaskClick={handleTaskClick} />
        <TaskColumn title="Completed" status="completed" onTaskClick={handleTaskClick} />
      </div>
      
      {/* Include the StepWizard component */}
      <StepWizard />
    </div>
  );
};

export default TasksView;