/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/form/FormViewer.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ViewerProps } from "../types";

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

export default function FormViewer({ step, onComplete }: ViewerProps) {
  const [values, setValues] = useState<Record<string, any>>(step.result || {});
  
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onComplete(values);
  }
  
  const fields = step.config?.fields || [];
  
  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-medium mb-4">{step.config?.title || step.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{step.config?.description || step.description}</p>
      
      <div className="space-y-4">
        {fields.map((field: FormField) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type === 'number' ? 'number' : 'text'}
              value={values[field.name] || ""}
              onChange={(e) => setValues({...values, [field.name]: e.target.value})}
              required={field.required}
            />
          </div>
        ))}
      </div>
      
      <Button type="submit" className="mt-4">Submit</Button>
    </form>
  );
}
