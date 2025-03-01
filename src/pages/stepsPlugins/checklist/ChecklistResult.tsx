// src/pages/stepsPlugins/checklist/ChecklistResult.tsx
import { List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResultRendererProps } from "../types";

export default function ChecklistResult({ step }: ResultRendererProps) {
  const result = step.result;
  if (!result) return null;
  
  const completedItems = result.completedItems || [];
  const totalItems = (step.config?.items || []).length;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <List size={16} className="text-green-500" />
          <span className="font-medium">Checklist</span>
        </div>
        <Badge>
          {completedItems.length}/{totalItems} Completed
        </Badge>
      </div>
      
      <div className="text-sm">
        <span className="text-muted-foreground">
          Completed at: {new Date(result.completedAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}