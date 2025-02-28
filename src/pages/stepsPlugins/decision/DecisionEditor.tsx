/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/decision/DecisionEditor.tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { EditorProps } from "../types";

export default function DecisionEditor({ step, onChange }: EditorProps) {
  const config = step.config || {};
  const options = config.options || [
    { id: 'approve', label: 'Approve', color: 'green' },
    { id: 'reject', label: 'Reject', color: 'red' }
  ];
  
  function updateConfig(updates: Record<string, any>) {
    onChange({ 
      config: { ...config, ...updates }
    });
  }
  
  function addOption() {
    const newOptions = [...options];
    newOptions.push({
      id: `option-${Date.now()}`,
      label: `Option ${options.length + 1}`,
      color: 'gray'
    });
    updateConfig({ options: newOptions });
  }
  
  function removeOption(index: number) {
    if (options.length <= 2) return; // Keep at least 2 options
    
    const newOptions = [...options];
    newOptions.splice(index, 1);
    updateConfig({ options: newOptions });
  }
  
  function updateOption(index: number, updates: any) {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    updateConfig({ options: newOptions });
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Decision Title</Label>
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
          id="requireComment"
          checked={config.requireComment ?? true}
          onCheckedChange={(checked) => updateConfig({ requireComment: checked })}
        />
        <Label htmlFor="requireComment">Require comment</Label>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Decision Options</Label>
          <Button size="sm" variant="outline" onClick={addOption} disabled={options.length >= 5}>
            <Plus className="h-4 w-4 mr-1" /> Add Option
          </Button>
        </div>
        
        {options.map((option: any, index: number) => (
          <div key={option.id} className="border p-3 mb-3 rounded-md">
            <div className="flex justify-between mb-2">
              <h4 className="text-sm font-medium">Option {index + 1}</h4>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => removeOption(index)}
                disabled={options.length <= 2}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-3 grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor={`option-${index}-id`} className="text-xs">Option ID</Label>
                <Input
                  id={`option-${index}-id`}
                  value={option.id}
                  onChange={(e) => updateOption(index, { id: e.target.value })}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`option-${index}-label`} className="text-xs">Display Label</Label>
                <Input
                  id={`option-${index}-label`}
                  value={option.label}
                  onChange={(e) => updateOption(index, { label: e.target.value })}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`option-${index}-color`} className="text-xs">Color</Label>
                <select
                  id={`option-${index}-color`}
                  value={option.color}
                  onChange={(e) => updateOption(index, { color: e.target.value })}
                  className="px-3 py-1 border rounded-md text-sm w-full"
                >
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="yellow">Yellow</option>
                  <option value="purple">Purple</option>
                  <option value="gray">Gray</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}