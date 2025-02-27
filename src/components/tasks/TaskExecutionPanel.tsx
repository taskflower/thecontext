// src/components/tasks/TaskExecutionPanel.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/store/taskStore";
import { ITask, ITaskStep } from "@/utils/tasks/taskTypes";

interface TaskExecutionPanelProps {
  taskId: string;
}

export const TaskExecutionPanel: React.FC<TaskExecutionPanelProps> = ({
  taskId,
}) => {
  const task = useTaskStore((state) =>
    state.tasks.find((t: ITask) => t.id === taskId)
  );
  const executeAllTaskSteps = useTaskStore(
    (state) => state.executeAllTaskSteps
  );

  if (!task) return null;

  const handleExecuteAll = async () => {
    await executeAllTaskSteps(taskId);
  };

  const pendingCount = task.steps.filter(
    (s: ITaskStep) => s.status === "pending"
  ).length;
  const completedCount = task.steps.filter(
    (s: ITaskStep) => s.status === "completed"
  ).length;
  const failedCount = task.steps.filter(
    (s: ITaskStep) => s.status === "failed"
  ).length;

  return (
    <div className="border rounded-md p-4 bg-muted/20">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Wykonaj zadanie</h3>
          <p className="text-sm text-muted-foreground">
            {pendingCount} kroków oczekujących, {completedCount} zakończonych,{" "}
            {failedCount} błędów
          </p>
        </div>

        <Button
          onClick={handleExecuteAll}
          disabled={task.status === "in_progress" || pendingCount === 0}
        >
          {task.status === "in_progress"
            ? "Wykonywanie..."
            : "Wykonaj wszystkie kroki"}
        </Button>
      </div>
    </div>
  );
};
