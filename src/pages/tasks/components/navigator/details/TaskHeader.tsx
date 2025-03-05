// src/pages/tasks/components/navigator/details/TaskHeader.tsx
import { PlayCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { useWizardStore } from "@/store/wizardStore";
import { useStepStore } from "@/store/stepStore";
import { useTaskStore } from "@/store/taskStore";
import { TaskResultJsonViewer } from "@/pages/steps/details/TaskResultJsonViewer";

interface TaskHeaderProps {
  task: Task;
}

export function TaskHeader({ task }: TaskHeaderProps) {
  const { openWizard } = useWizardStore();
  const { getTaskSteps, updateStep } = useStepStore();
  const { updateTask } = useTaskStore();

  const handleExecuteAllSteps = () => {
    // Get all steps for this task
    const steps = getTaskSteps(task.id).sort((a, b) => a.order - b.order);

    // Make sure we have at least one step
    if (steps.length === 0) {
      alert(
        "No steps defined for this task. Please add at least one step first."
      );
      return;
    }

    // Reset all steps to pending
    steps.forEach((step) => {
      updateStep(step.id, {
        status: "pending",
        result: null,
      });
    });

    // Set task's currentStepId to the first step if there is one
    updateTask(task.id, {
      currentStepId: steps[0].id,
      status: "in-progress",
    });

    // Adding small delay to ensure state updates are processed
    setTimeout(() => {
      openWizard(task.id);
    }, 100);
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
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}

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

// Helper functions
function getStatusBadge(status: string) {
  switch (status) {
    case "todo":
    case "pending":
      return (
        <Badge variant="outline" className="bg-gray-100">
          Pending
        </Badge>
      );
    case "in-progress":
    case "in_progress":
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          In Progress
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Completed
        </Badge>
      );
    case "failed":
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          Failed
        </Badge>
      );
    case "skipped":
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800">
          Skipped
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "low":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Low Priority
        </Badge>
      );
    case "medium":
      return (
        <Badge
          variant="secondary"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          Medium Priority
        </Badge>
      );
    case "high":
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200">
          High Priority
        </Badge>
      );
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
}

export default TaskHeader;
