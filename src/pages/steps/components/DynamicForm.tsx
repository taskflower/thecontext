/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/steps/components/DynamicForm.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DynamicFormProps {
  schema: Record<string, any>;
  values: Record<string, any>;
  onChange: (field: string, value: any) => void;
}

// Define a custom type for field types to fix the TypeScript error
type FieldType = 'string' | 'textarea' | 'number' | 'boolean' | 'date' | 'array' | string;

interface FormField {
  key: string;
  type: FieldType;
  label: string;
  defaultValue: any;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ schema, values, onChange }) => {
  // Process the schema to get form fields
  const fields = Object.entries(schema).map(([key, value]) => {
    // Start with the JavaScript typeof as the base type
    let fieldType: FieldType = typeof value;
    
    // Special handling for fields based on naming conventions
    if (key.includes('title') || key.includes('name') || key.includes('label')) {
      fieldType = 'string';
    } else if (key.includes('description') || key.includes('content')) {
      fieldType = 'textarea';
    } else if (key.toLowerCase().includes('date')) {
      fieldType = 'date';
    } else if (typeof value === 'boolean') {
      fieldType = 'boolean';
    } else if (Array.isArray(value)) {
      fieldType = 'array';
    }
    
    // Convert camelCase to Title Case for label
    const label = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
    
    return {
      key,
      type: fieldType,
      label,
      defaultValue: value
    };
  });
  
  // Render each field based on its type
  const renderField = (field: FormField) => {
    // Important: Check if the field value exists in the values prop first
    // If not, then fall back to the default value from the schema
    const currentValue = values[field.key] !== undefined ? values[field.key] : field.defaultValue;
    
    switch (field.type) {
      case 'string':
        return (
          <Input
            id={`field-${field.key}`}
            value={currentValue || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            id={`field-${field.key}`}
            value={currentValue || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
            className="min-h-20"
          />
        );
      
      case 'number':
        return (
          <Input
            id={`field-${field.key}`}
            type="number"
            value={currentValue || ''}
            onChange={(e) => onChange(field.key, Number(e.target.value))}
          />
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={`field-${field.key}`}
              checked={!!currentValue}
              onCheckedChange={(checked) => onChange(field.key, checked)}
            />
            <Label htmlFor={`field-${field.key}`}>
              {field.label}
            </Label>
          </div>
        );
      
      case 'date':
        return (
          <Input
            id={`field-${field.key}`}
            type="date"
            value={currentValue || ''}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        );
      
      case 'array':
        if (field.key === 'requiredFields') {
          // Special handling for requiredFields
          return (
            <Select 
              value={Array.isArray(currentValue) && currentValue.length > 0 ? currentValue[0] : 'title'} 
              onValueChange={(value) => onChange(field.key, [value])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select required field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="tags">Tags</SelectItem>
              </SelectContent>
            </Select>
          );
        }
        
        // Improve array handling to show a simplified representation
        return (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {Array.isArray(currentValue) ? 
                `${currentValue.length} items in array` : 
                'No items defined'
              }
            </div>
            <Button 
              type="button" 
              size="sm" 
              variant="outline"
              onClick={() => {
                // For simplicity, just show an alert for now
                // In a real application, you would open a modal for array editing
                alert('Array editing in a modal would be implemented here');
              }}
            >
              Edit Array Items
            </Button>
          </div>
        );
      
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Unknown field type: {field.type}
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key} className="grid gap-2">
          {field.type !== 'boolean' && (
            <Label htmlFor={`field-${field.key}`}>
              {field.label}
            </Label>
          )}
          {renderField(field)}
        </div>
      ))}
    </div>
  );
};