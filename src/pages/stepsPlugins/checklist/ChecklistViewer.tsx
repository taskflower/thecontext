// src/pages/stepsPlugins/checklist/ChecklistViewer.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { ViewerProps } from "../types";

interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
}

interface ConversationItem {
  role: "assistant" | "user";
  content: string;
}

export default function ChecklistViewer({ step, onComplete }: ViewerProps) {
  const items = step.config?.items || [];
  const requireAllItems = step.config?.requireAllItems ?? true;
  
  // Initialize checked state from previous result or empty
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    step.result?.rawCheckedItems || step.result?.checkedItems || {}
  );
  
  const [isValid, setIsValid] = useState(false);
  
  // Check if all required items are checked
  useEffect(() => {
    if (requireAllItems) {
      // All items must be checked
      setIsValid(items.every((item: ChecklistItem) => checkedItems[item.id]));
    } else {
      // Only required items must be checked
      setIsValid(items
        .filter((item: ChecklistItem) => item.required)
        .every((item: ChecklistItem) => checkedItems[item.id])
      );
    }
  }, [checkedItems, items, requireAllItems]);
  
  const handleToggleItem = (itemId: string, checked: boolean) => {
    setCheckedItems({
      ...checkedItems,
      [itemId]: checked
    });
  };
  
  const handleSubmit = () => {
    if (!isValid) return;
    
    const completedItems = items
      .filter((item: ChecklistItem) => checkedItems[item.id])
      .map((item: ChecklistItem) => item.id);
    
    // Create conversation format
    const conversationData: ConversationItem[] = [];
    
    // Add each checked item as a pair of assistant-user messages
    items.forEach((item: ChecklistItem) => {
      conversationData.push(
        { role: "assistant", content: item.id },
        { role: "user", content: String(checkedItems[item.id] || false) }
      );
    });
    
    // Include both formats for backward compatibility
    onComplete({
      rawCheckedItems: checkedItems,
      rawCompletedItems: completedItems,
      conversationData: conversationData,
      completedAt: new Date().toISOString()
    });
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{step.config?.title || step.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{step.config?.description || step.description}</p>
      </div>
      
      <div className="space-y-3">
        {items.map((item: ChecklistItem) => (
          <div key={item.id} className="flex items-start space-x-2">
            <Checkbox
              id={item.id}
              checked={checkedItems[item.id] || false}
              onCheckedChange={(checked) => handleToggleItem(item.id, !!checked)}
            />
            <Label htmlFor={item.id} className="text-sm leading-tight cursor-pointer">
              {item.text} {item.required && <span className="text-red-500">*</span>}
            </Label>
          </div>
        ))}
      </div>
      
      {!isValid && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please complete {requireAllItems ? 'all' : 'all required'} items before proceeding.
          </AlertDescription>
        </Alert>
      )}
      
      {isValid && (
        <Alert className="bg-green-50 text-green-800 border-green-200 mt-4">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            All required items have been checked!
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleSubmit}
        disabled={!isValid}
        className="w-full mt-4"
      >
        Complete Checklist
      </Button>
    </div>
  );
}