// src/pages/tasks/components/navigator/details/TaskHeader.tsx
import { PlayCircle } from "lucide-react";
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
      alert("No steps defined for this task. Please add at least one step first.");
      return;
    }
    
    console.log(`Executing all steps for task ${task.id}. Found ${steps.length} steps.`);
    
    // Reset all steps to pending
    steps.forEach(step => {
      console.log(`Resetting step ${step.id} to pending status`);
      updateStep(step.id, { 
        status: 'pending',
        result: null
      });
    });
    
    // Set task's currentStepId to the first step if there is one
    console.log(`Setting task's currentStepId to first step: ${steps[0].id}`);
    updateTask(task.id, { 
      currentStepId: steps[0].id,
      status: 'in-progress' 
    });
    
    // Adding small delay to ensure state updates are processed
    setTimeout(() => {
      console.log(`Opening wizard for task ${task.id}`);
      openWizard(task.id);
    }, 100);
  };

  // Get steps for this task
  const steps = getTaskSteps(task.id).sort((a, b) => a.order - b.order);

  return (
    <div className="px-6 py-4 border-b">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mt-2">{task.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Task result JSON viewer */}
          <TaskResultJsonViewer steps={steps} />

          <Button onClick={handleExecuteAllSteps} data-testid="execute-all-steps">
            <PlayCircle className="mr-2 h-4 w-4" />
            Wykonaj wszystkie kroki
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return <Badge variant="outline">Oczekujący</Badge>;
    case "in-progress":
    case "in_progress":
      return <Badge variant="secondary">W trakcie</Badge>;
    case "completed":
      return <Badge>Ukończony</Badge>;
    case "failed":
      return <Badge variant="destructive">Nieudany</Badge>;
    case "skipped":
      return <Badge variant="outline">Pominięty</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "low":
      return <Badge variant="outline">Niski priorytet</Badge>;
    case "medium":
      return <Badge variant="secondary">Średni priorytet</Badge>;
    case "high":
      return <Badge variant="destructive">Wysoki priorytet</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
}

export default TaskHeader;