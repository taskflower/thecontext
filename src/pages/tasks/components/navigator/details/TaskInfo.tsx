// src/pages/tasks/components/navigator/TaskInfo.tsx

import { Folder } from "lucide-react";

interface TaskInfoProps {
  description: string;
  scenarioId?: string;
  scenarioName: string;
}

export function TaskInfo({
  description,
  scenarioId,
  scenarioName,
}: TaskInfoProps) {
  return (
    <div>
      {scenarioId && (
        <div>
          <div className="flex items-center gap-2 text-sm">
            <Folder className="h-4 w-4" />
            Projekt: {scenarioName}
          </div>
        </div>
      )}
      <p className="text-sm text-muted-foreground italic">
        {description || "Brak opisu."}
      </p>
    </div>
  );
}

export default TaskInfo;
