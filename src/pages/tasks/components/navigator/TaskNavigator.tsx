// src/pages/tasks/TaskFlow/tasks/components/TaskNavigator.tsx
import React from "react";
import TaskListNavigator from "./TaskListNavigator";
import TaskDetailView from "./details/TaskDetailView";


const TaskNavigator: React.FC = () => {
  return (
    <div className="h-full flex">
      <div className="w-1/3 h-full border-r">
        <TaskListNavigator />
      </div>
      <div className="w-2/3 h-full">
        <TaskDetailView />
      </div>
    </div>
  );
};

export default TaskNavigator;