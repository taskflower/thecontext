// src/pages/stepsPlugins/checklist/ChecklistResult.tsx
import { List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResultRendererProps } from "../types";

interface ConversationItem {
  role: "assistant" | "user";
  content: string;
}

export default function ChecklistResult({ step }: ResultRendererProps) {
  const result = step.result;
  if (!result) return null;
  
  let completedItems: string[] = [];
  const totalItems = (step.config?.items || []).length;

  // Handle both new conversation format and legacy format
  if (result.conversationData) {
    // Extract completed items from conversation data
    const conversationData = result.conversationData as ConversationItem[];
    const checkedMap: Record<string, boolean> = {};
    
    // Process pairs (assistant key, user value)
    for (let i = 0; i < conversationData.length; i += 2) {
      if (i + 1 < conversationData.length) {
        const itemId = conversationData[i].content;
        const isChecked = conversationData[i + 1].content === "true";
        checkedMap[itemId] = isChecked;
      }
    }
    
    // Get IDs of checked items
    completedItems = Object.keys(checkedMap).filter(id => checkedMap[id]);
  } else if (result.rawCompletedItems) {
    // Direct access if available
    completedItems = result.rawCompletedItems;
  } else {
    // Legacy format
    completedItems = result.completedItems || [];
  }
  
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
      
      {/* Optional debug view for new conversation format */}
      {result.conversationData && (
        <div className="mt-2 pt-2 border-t">
          <div className="text-xs text-muted-foreground">Conversation Format:</div>
          <div className="text-xs font-mono bg-muted p-2 rounded max-h-32 overflow-auto">
            {JSON.stringify(result.conversationData)}
          </div>
        </div>
      )}
    </div>
  );
}