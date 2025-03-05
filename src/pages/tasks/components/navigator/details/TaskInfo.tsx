// src/pages/tasks/components/navigator/details/TaskInfo.tsx
import { Folder, Calendar} from "lucide-react";

interface TaskInfoProps {
  description: string;
  scenarioId?: string;
  scenarioName: string;
  dueDate?: string;
  createdAt?: string;
}

export function TaskInfo({
  description,
  scenarioId,
  scenarioName,
  dueDate,  

}: TaskInfoProps) {
  // Format date for display if available
  const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString() : null;

  return (
    <div className="space-y-3 w-full">
      {/* Project (Scenario) */}
      {scenarioId && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <Folder className="h-4 w-4 text-blue-500" />
          <span>Project:</span> 
          <span className="text-muted-foreground">{scenarioName}</span>
        </div>
      )}

      {/* Due Date - Only show if available */}
      {formattedDueDate && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <Calendar className="h-4 w-4 text-green-500" />
          <span>Due Date:</span>
          <span className="text-muted-foreground">{formattedDueDate}</span>
        </div>
      )}

      {/* Description */}
      <div className="pt-2">
        <h3 className="text-sm font-medium mb-1">Description</h3>
        <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md border">
          {description || "No description provided."}
        </p>
      </div>
    </div>
  );
}

export default TaskInfo;