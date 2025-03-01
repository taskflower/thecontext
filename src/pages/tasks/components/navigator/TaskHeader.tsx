// src/pages/tasks/components/navigator/TaskHeader.tsx
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { useWizardStore } from "@/store/wizardStore";

interface TaskHeaderProps {
  task: Task;
}

export function TaskHeader({ task }: TaskHeaderProps) {
  const { openWizard } = useWizardStore();

  const handleExecuteAllSteps = () => {
    openWizard(task.id);
  };

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
        <Button onClick={handleExecuteAllSteps}>
          <PlayCircle className="mr-2 h-4 w-4" />
          Wykonaj wszystkie kroki
        </Button>
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