/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/tasks/components/StepConfigDialog.tsx
import React, { useState } from "react";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPluginSchema } from "../../stepsPlugins/registry";
import { Step } from "@/types";

interface StepConfigDialogProps {
  step: Step;
  onClose: () => void;
  onSave: (config: any, options: any) => void;
}

type SchemaField = {
  label: string;
  description?: string;
  type: string;
  path: string[];
  defaultValue?: any;
  enum?: string[];
  options?: Array<{ label: string; value: string }>;
  properties?: Record<string, any>;
};

// Helper function to extract fields from schema
function extractFields(schema: any, prefix: string[] = []): SchemaField[] {
  const fields: SchemaField[] = [];
  
  if (!schema) return fields;
  
  if (schema.type === 'object' && schema.properties) {
    // Process object properties
    for (const [key, prop] of Object.entries<any>(schema.properties)) {
      if (prop.type === 'object' && prop.properties) {
        // Recursive for nested objects
        fields.push(...extractFields(prop, [...prefix, key]));
      } else {
        // Simple field
        fields.push({
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          description: prop.description,
          type: prop.type,
          path: [...prefix, key],
          defaultValue: prop.default,
          enum: prop.enum,
          options: prop.enum?.map((v: string) => ({ label: v, value: v }))
        });
      }
    }
  }
  
  return fields;
}

// Helper function to get nested value from object by path
function getValueByPath(obj: any, path: string[]): any {
  return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

// Helper function to set nested value in object by path
function setValueByPath(obj: any, path: string[], value: any): any {
  const result = { ...obj };
  let current = result;
  
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current[key] = current[key] !== undefined ? { ...current[key] } : {};
    current = current[key];
  }
  
  current[path[path.length - 1]] = value;
  return result;
}

const StepConfigDialog: React.FC<StepConfigDialogProps> = ({ step, onClose, onSave }) => {
  // Get schemas for this step type
  const schema = getPluginSchema(step.type);
  
  // Initialize with current values
  const [config, setConfig] = useState(step.config || {});
  const [options, setOptions] = useState(step.options || {});
  
  // Extract fields from schema
  const configFields = schema?.properties?.config ? 
    extractFields(schema.properties.config, ['config']) : [];
    
  const optionsFields = schema?.properties?.options ? 
    extractFields(schema.properties.options, ['options']) : [];
  
  // Create field groups for better organization
  const fieldGroups = {
    config: configFields,
    options: optionsFields
  };
  
  const handleValueChange = (path: string[], value: any) => {
    // Determine if we're updating config or options
    if (path[0] === 'config') {
      setConfig(setValueByPath(config, path.slice(1), value));
    } else if (path[0] === 'options') {
      setOptions(setValueByPath(options, path.slice(1), value));
    }
  };
  
  const renderField = (field: SchemaField) => {
    // Get current value with proper default
    const currentValue = getValueByPath(
      field.path[0] === 'config' ? { config } : { options }, 
      field.path
    ) ?? field.defaultValue;
    
    switch (field.type) {
      case 'string':
        if (field.enum) {
          // Render select for enum types
          return (
            <Select
              value={String(currentValue || '')}
              onValueChange={(value) => handleValueChange(field.path, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        
        // Render textarea for longer strings
        if (field.path.includes('description') || field.path.includes('content') || 
            field.path.includes('template')) {
          return (
            <Textarea
              value={currentValue || ''}
              onChange={(e) => handleValueChange(field.path, e.target.value)}
              placeholder={field.label}
              className="min-h-20"
            />
          );
        }
        
        // Default to input for regular strings
        return (
          <Input
            value={currentValue || ''}
            onChange={(e) => handleValueChange(field.path, e.target.value)}
            placeholder={field.label}
          />
        );
        
      case 'number':
        return (
          <Input
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleValueChange(field.path, Number(e.target.value))}
            placeholder={field.label}
          />
        );
        
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.path.join('.')}
              checked={!!currentValue}
              onCheckedChange={(checked) => handleValueChange(field.path, checked)}
            />
            <Label htmlFor={field.path.join('.')}>
              {field.label}
            </Label>
          </div>
        );
        
      case 'array':
        // For now, we'll just show a textarea for arrays with JSON format
        return (
          <div>
            <Textarea
              value={currentValue ? JSON.stringify(currentValue, null, 2) : '[]'}
              onChange={(e) => {
                try {
                  const value = JSON.parse(e.target.value);
                  handleValueChange(field.path, value);
                } catch (error) {
                  console.error('Invalid JSON:', error);
                }
              }}
              placeholder={`Enter ${field.label} as JSON array`}
              className="min-h-20 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">Enter as JSON array</p>
          </div>
        );
        
      default:
        return <div>Unsupported field type: {field.type}</div>;
    }
  };
  
  const handleSave = () => {
    onSave(config, options);
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Configure Step: {step.title}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="config">
          <TabsList>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="config" className="space-y-4 py-4">
            {fieldGroups.config.length > 0 ? (
              fieldGroups.config.map((field, index) => (
                <div key={index} className="grid gap-2">
                  <Label htmlFor={field.path.join('.')}>
                    {field.label}
                  </Label>
                  {renderField(field)}
                  {field.description && (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                No configuration options available for this step type.
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="options" className="space-y-4 py-4">
            {fieldGroups.options.length > 0 ? (
              fieldGroups.options.map((field, index) => (
                <div key={index} className="grid gap-2">
                  <Label htmlFor={field.path.join('.')}>
                    {field.label}
                  </Label>
                  {renderField(field)}
                  {field.description && (
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">
                No advanced options available for this step type.
              </p>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StepConfigDialog;