/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/checklist/ChecklistEditor.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash } from "lucide-react";
import { EditorProps } from "../types";

export default function ChecklistEditor({ step, onChange }: EditorProps) {
  const config = step.config || {};
  const items = config.items || [];
  
  function updateConfig(updates: Record<string, any>) {
    onChange({ 
      config: { ...config, ...updates }
    });
  }
  
  function addItem() {
    const newItems = [...items];
    newItems.push({
      id: `item-${Date.now()}`,
      text: `Item ${items.length + 1}`,
      required: false
    });
    updateConfig({ items: newItems });
  }
  
  function removeItem(index: number) {
    const newItems = [...items];
    newItems.splice(index, 1);
    updateConfig({ items: newItems });
  }
  
  function updateItem(index: number, updates: any) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    updateConfig({ items: newItems });
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Checklist Title</Label>
        <Input
          id="title"
          value={config.title || step.title || ''}
          onChange={(e) => updateConfig({ title: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={config.description || step.description || ''}
          onChange={(e) => updateConfig({ description: e.target.value })}
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="requireAll"
          checked={config.requireAllItems ?? true}
          onCheckedChange={(checked) => updateConfig({ requireAllItems: checked })}
        />
        <Label htmlFor="requireAll">Require all items to be checked</Label>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Checklist Items</Label>
          <Button size="sm" variant="outline" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" /> Add Item
          </Button>
        </div>
        
        {items.map((item: any, index: number) => (
          <div key={item.id} className="border p-3 mb-3 rounded-md">
            <div className="flex justify-between mb-2">
              <h4 className="text-sm font-medium">Item {index + 1}</h4>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => removeItem(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor={`item-${index}-text`} className="text-xs">Item Text</Label>
                <Input
                  id={`item-${index}-text`}
                  value={item.text}
                  onChange={(e) => updateItem(index, { text: e.target.value })}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`item-${index}-required`}
                  checked={item.required}
                  onCheckedChange={(checked) => updateItem(index, { required: checked })}
                />
                <Label htmlFor={`item-${index}-required`} className="text-xs">Required item</Label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}