import { useState } from "react";

import { TaskListNavigator } from "@/components/tasks/TaskListNavigator";
import { TaskDetailNavigator } from "@/components/tasks/TaskDetailNavigator";
import { ITask } from "@/utils/tasks/taskTypes";

export default function TasksPage() {
  const [setSelectedTask] = useState<ITask | null>(null);

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      <div className="col-span-4">
        <TaskListNavigator onSelectTask={setSelectedTask} />
      </div>
      <div className="col-span-8">
        <TaskDetailNavigator />
      </div>
    </div>
  );
}
