import React from "react";
import TaskColumn from "./TaskColumn";


const TasksView: React.FC = () => {
  return (
    <div className="p-6 flex-1 overflow-auto">
      <div className="flex gap-4 h-full">
        <TaskColumn title="To Do" status="todo" />
        <TaskColumn title="In Progress" status="in-progress" />
        <TaskColumn title="Under Review" status="review" />
        <TaskColumn title="Completed" status="completed" />
      </div>
    </div>
  );
};

export default TasksView;