// src/pages/stepsPlugins/checklist/ChecklistResult.tsx
import { List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResultRendererProps } from "../types";
import { ConversationItem } from "@/types";

export default function ChecklistResult({ step }: ResultRendererProps) {
  const result = step.result;
  if (!result) return null;
  
  let completedItems: string[] = [];
  const totalItems = (step.config?.items || []).length;

  // Priority 1: Use step's conversationData if available
  if (step.conversationData && step.conversationData.length > 0) {
    const checkedMap: Record<string, boolean> = {};
    
    // Process pairs (assistant key, user value)
    for (let i = 0; i < step.conversationData.length; i += 2) {
      if (i + 1 < step.conversationData.length) {
        const itemId = step.conversationData[i].content;
        const isChecked = step.conversationData[i + 1].content === "true";
        checkedMap[itemId] = isChecked;
      }
    }
    
    // Get IDs of checked items
    completedItems = Object.keys(checkedMap).filter(id => checkedMap[id]);
  }
  // Priority 2: Use result.conversationData if available
  else if (result.conversationData) {
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
  } 
  // Direct access if available (fallback 1)
  else if (result.rawCompletedItems) {
    completedItems = result.rawCompletedItems;
  } 
  // Legacy format (fallback 2)
  else {
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
    </div>
  );
}