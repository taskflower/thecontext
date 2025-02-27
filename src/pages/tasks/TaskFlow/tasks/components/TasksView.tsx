import React from "react";
import TaskColumn from "./TaskColumn";
import TaskboardPanel from "./TaskboardPanel";

interface TasksViewProps {
  onTaskClick?: (taskId: string) => void;
}

const TasksView: React.FC<TasksViewProps> = ({ onTaskClick }) => {
  return (
    <div className="p-6 flex-1 overflow-auto">
      <TaskboardPanel />
      <div className="flex gap-4 h-full">
        <TaskColumn title="To Do" status="todo" onTaskClick={onTaskClick} />
        <TaskColumn title="In Progress" status="in-progress" onTaskClick={onTaskClick} />
        <TaskColumn title="Under Review" status="review" onTaskClick={onTaskClick} />
        <TaskColumn title="Completed" status="completed" onTaskClick={onTaskClick} />
      </div>
    </div>
  );
};

export default TasksView;