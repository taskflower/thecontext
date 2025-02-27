/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/plugins/form/renderer.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { FormField } from "./types";
import { PluginRendererProps } from "../registry";

const FormRenderer: React.FC<PluginRendererProps> = ({ step, onComplete }) => {
  const [formData, setFormData] = React.useState<Record<string, any>>(
    step.result || {}
  );
  
  // Helper to render the appropriate field component based on type
  const renderField = (field: FormField) => {
    const value = formData[field.name] ?? field.defaultValue ?? '';
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'date':
      case 'number':
        return (
          <Input
            id={`field-${field.name}`}
            type={field.type}
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            id={`field-${field.name}`}
            value={value}
            placeholder={field.placeholder}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            className="min-h-20"
          />
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`field-${field.name}`}
              checked={!!value}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
            <Label htmlFor={`field-${field.name}`}>
              {field.label}
            </Label>
          </div>
        );
        
      // Additional field types can be added here
        
      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };
  
  // Handle field value change
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };
  
  // Get fields from step config
  const fields = step.config?.fields || [];
  
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">{step.config?.title || step.title}</h3>
        <p className="text-muted-foreground">{step.config?.description || step.description}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field: FormField) => (
          <div key={field.name} className="grid gap-2">
            {field.type !== 'checkbox' && (
              <Label htmlFor={`field-${field.name}`}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
            )}
            {renderField(field)}
          </div>
        ))}
        
        <div className="pt-4">
          <Button type="submit" className="w-full">
            {step.config?.submitLabel || 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FormRenderer;