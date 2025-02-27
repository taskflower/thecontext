// src/pages/tasks/TaskFlow/task-steps/components/TaskForm.tsx
import React, { useMemo } from "react";
import { useTaskStepStore } from "../store";
import { TaskStep } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TaskFormProps {
  step: TaskStep;
}

// Field interface for form fields
interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: string | number;
}

const TaskForm: React.FC<TaskFormProps> = ({ step }) => {
  const { updateStep, updateTaskScope, executeStep } = useTaskStepStore();
  
  // Extract form configuration
  const formConfig = useMemo(() => {
    const { config } = step.schema;
    
    return {
      fields: config.fields as FormField[] || [],
      submitText: config.submitText || 'Submit'
    };
  }, [step.schema]);
  
  // Extract values from step input or initialize empty
  const formValues = useMemo(() => {
    return step.input || {};
  }, [step.input]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Collect form values
    const values: Record<string, any> = {};
    formConfig.fields.forEach(field => {
      const value = formData.get(field.id);
      values[field.id] = value;
    });
    
    // Update step with form values
    updateStep(step.id, {
      input: values
    });
    
    // If output mapping defined, update task scope
    if (step.schema.outputMapping) {
      const scopeUpdates: Record<string, any> = {};
      Object.entries(step.schema.outputMapping).forEach(([outputProp, scopeProp]) => {
        scopeUpdates[scopeProp] = values[outputProp];
      });
      updateTaskScope(step.taskId, scopeUpdates);
    }
    
    // Mark step as completed
    executeStep(step.id);
  };
  
  // Render each form field based on type
  const renderField = (field: FormField) => {
    const value = formValues[field.id] !== undefined ? formValues[field.id] : field.defaultValue;
    
    switch (field.type) {
      case 'textarea':
        return (
          <div className="grid gap-2" key={field.id}>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Textarea
              id={field.id}
              name={field.id}
              placeholder={field.placeholder}
              required={field.required}
              defaultValue={value?.toString()}
              rows={4}
            />
          </div>
        );
        
      case 'select':
        return (
          <div className="grid gap-2" key={field.id}>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Select 
              defaultValue={value?.toString()} 
              name={field.id}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || "Select option"} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
        
      case 'number':
        return (
          <div className="grid gap-2" key={field.id}>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              name={field.id}
              type="number"
              placeholder={field.placeholder}
              required={field.required}
              defaultValue={value?.toString()}
            />
          </div>
        );
        
      case 'date':
        return (
          <div className="grid gap-2" key={field.id}>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              name={field.id}
              type="date"
              required={field.required}
              defaultValue={value?.toString()}
            />
          </div>
        );
        
      case 'text':
      default:
        return (
          <div className="grid gap-2" key={field.id}>
            <Label htmlFor={field.id}>{field.label}</Label>
            <Input
              id={field.id}
              name={field.id}
              type="text"
              placeholder={field.placeholder}
              required={field.required}
              defaultValue={value?.toString()}
            />
          </div>
        );
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{step.schema.title}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid gap-4">
            {formConfig.fields.map(renderField)}
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit">{formConfig.submitText}</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TaskForm;