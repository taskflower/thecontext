// src/pages/tasks/components/navigator/details/TaskHeader.tsx
import { PlayCircle, Calendar } from "lucide-react";

import { Task } from "@/types";

import taskService from "@/pages/tasks/services/TaskService";
import { useStepStore } from "@/store";
import { TaskResultJsonViewer } from "@/pages/steps";
import { Button } from "@/components/ui";
import { PriorityBadge, StatusBadge } from "@/components/status";


interface TaskHeaderProps {
  task: Task;
}

export function TaskHeader({ task }: TaskHeaderProps) {
  const { getTaskSteps } = useStepStore();

  const handleExecuteAllSteps = () => {
    taskService.executeTask(task.id);
  };

  // Get steps for this task
  const steps = getTaskSteps(task.id).sort((a, b) => a.order - b.order);

  // Format date for display
  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : null;

  return (
    <div className="px-6 py-4 border-b bg-background shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{task.title}</h2>
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />

            {formattedDueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDueDate}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Task result JSON viewer */}
          <TaskResultJsonViewer steps={steps} />

          <Button
            onClick={handleExecuteAllSteps}
            data-testid="execute-all-steps"
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Execute All Steps
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TaskHeader;