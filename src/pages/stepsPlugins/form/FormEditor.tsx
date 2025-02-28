/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/form/FormEditor.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";
import { EditorProps } from "../types";

export default function FormEditor({ step, onChange }: EditorProps) {
  const config = step.config || {};
  const fields = config.fields || [];
  
  function updateConfig(updates: Record<string, any>) {
    onChange({ 
      config: { ...config, ...updates }
    });
  }
  
  function addField() {
    const newFields = [...fields];
    newFields.push({
      name: `field${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: 'text',
      required: false
    });
    updateConfig({ fields: newFields });
  }
  
  function removeField(index: number) {
    const newFields = [...fields];
    newFields.splice(index, 1);
    updateConfig({ fields: newFields });
  }
  
  function updateField(index: number, updates: any) {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    updateConfig({ fields: newFields });
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
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
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <Label>Form Fields</Label>
          <Button size="sm" variant="outline" onClick={addField}>
            <Plus className="h-4 w-4 mr-1" /> Add Field
          </Button>
        </div>
        
        {fields.map((field:any, index: number) => (
          <div key={index} className="border p-3 mb-3 rounded-md">
            <div className="flex justify-between mb-2">
              <h4 className="text-sm font-medium">Field {index + 1}</h4>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => removeField(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-3">
              <div className="grid gap-1">
                <Label htmlFor={`field-${index}-name`} className="text-xs">Field Name</Label>
                <Input
                  id={`field-${index}-name`}
                  value={field.name}
                  onChange={(e) => updateField(index, { name: e.target.value })}
                />
              </div>
              
              <div className="grid gap-1">
                <Label htmlFor={`field-${index}-label`} className="text-xs">Display Label</Label>
                <Input
                  id={`field-${index}-label`}
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                />
              </div>
              
              <div className="flex gap-3">
                <div className="grid gap-1 flex-1">
                  <Label htmlFor={`field-${index}-type`} className="text-xs">Field Type</Label>
                  <select
                    id={`field-${index}-type`}
                    value={field.type}
                    onChange={(e) => updateField(index, { type: e.target.value })}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="date">Date</option>
                  </select>
                </div>
                
                <div className="grid gap-1 flex-1">
                  <Label htmlFor={`field-${index}-required`} className="text-xs">Required</Label>
                  <select
                    id={`field-${index}-required`}
                    value={field.required ? 'yes' : 'no'}
                    onChange={(e) => updateField(index, { required: e.target.value === 'yes' })}
                    className="px-3 py-1 border rounded-md text-sm"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}