/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/task-steps/components/StepEditor.tsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { StepSchema, StepType } from "../types";
import { useTaskStepStore } from "../store";
import StepTypeIcon from "./StepTypeIcon";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StepEditor: React.FC = () => {
  const {
    showStepEditor,
    toggleStepEditor,
    editingStep,
    updateStep,
    addStep,
    activeTaskId
  } = useTaskStepStore();
  
  const [stepData, setStepData] = useState<{
    title: string;
    description: string;
    type: StepType;
    config: Record<string, any>;
    inputMapping: Record<string, string>;
    outputMapping: Record<string, string>;
  }>({
    title: '',
    description: '',
    type: 'form',
    config: {},
    inputMapping: {},
    outputMapping: {}
  });
  
  // Reset form when editingStep changes
  useEffect(() => {
    if (editingStep) {
      const { schema } = editingStep;
      setStepData({
        title: schema.title,
        description: schema.description || '',
        type: schema.type,
        config: schema.config || {},
        inputMapping: schema.inputMapping || {},
        outputMapping: schema.outputMapping || {}
      });
    } else {
      setStepData({
        title: '',
        description: '',
        type: 'form',
        config: {},
        inputMapping: {},
        outputMapping: {}
      });
    }
  }, [editingStep]);
  
  const handleSave = () => {
    const schema: StepSchema = {
      id: editingStep?.schema.id || `schema-${Date.now()}`,
      title: stepData.title,
      description: stepData.description || undefined,
      type: stepData.type,
      config: stepData.config,
      inputMapping: Object.keys(stepData.inputMapping).length > 0 
        ? stepData.inputMapping 
        : undefined,
      outputMapping: Object.keys(stepData.outputMapping).length > 0 
        ? stepData.outputMapping 
        : undefined
    };
    
    if (editingStep) {
      updateStep(editingStep.id, { schema });
    } else if (activeTaskId) {
      addStep(activeTaskId, schema);
    }
    
    toggleStepEditor();
  };
  
  // Add a pair to mapping
  const addMappingPair = (type: 'input' | 'output') => {
    if (type === 'input') {
      setStepData(prev => ({
        ...prev,
        inputMapping: { ...prev.inputMapping, '': '' }
      }));
    } else {
      setStepData(prev => ({
        ...prev,
        outputMapping: { ...prev.outputMapping, '': '' }
      }));
    }
  };
  
  // Update mapping key or value
  const updateMapping = (
    type: 'input' | 'output', 
    oldKey: string, 
    newKey: string, 
    value: string
  ) => {
    if (type === 'input') {
      const newMapping = { ...stepData.inputMapping };
      delete newMapping[oldKey];
      newMapping[newKey] = value;
      setStepData(prev => ({
        ...prev,
        inputMapping: newMapping
      }));
    } else {
      const newMapping = { ...stepData.outputMapping };
      delete newMapping[oldKey];
      newMapping[newKey] = value;
      setStepData(prev => ({
        ...prev,
        outputMapping: newMapping
      }));
    }
  };
  
  // Remove a mapping pair
  const removeMapping = (type: 'input' | 'output', key: string) => {
    if (type === 'input') {
      const newMapping = { ...stepData.inputMapping };
      delete newMapping[key];
      setStepData(prev => ({
        ...prev,
        inputMapping: newMapping
      }));
    } else {
      const newMapping = { ...stepData.outputMapping };
      delete newMapping[key];
      setStepData(prev => ({
        ...prev,
        outputMapping: newMapping
      }));
    }
  };
  
  // Get config fields based on step type
  const renderConfigFields = () => {
    switch (stepData.type) {
      case 'form':
        return (
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Form Fields (JSON)</Label>
              <Textarea
                value={JSON.stringify(stepData.config.fields || [], null, 2)}
                onChange={(e) => {
                  try {
                    const fields = JSON.parse(e.target.value);
                    setStepData(prev => ({
                      ...prev,
                      config: { ...prev.config, fields }
                    }));
                  } catch (error) {
                    console.error('Error parsing JSON:', error);
                  }
                }}
                rows={6}
              />
            </div>
            <div className="grid gap-2">
              <Label>Submit Button Text</Label>
              <Input
                value={stepData.config.submitText || 'Submit'}
                onChange={(e) => {
                  setStepData(prev => ({
                    ...prev,
                    config: { ...prev.config, submitText: e.target.value }
                  }));
                }}
              />
            </div>
          </div>
        );
        
      case 'createDocument':
      case 'getDocument':
        return (
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Document Template</Label>
              <Select
                value={stepData.config.templateId || ''}
                onValueChange={(value) => {
                  setStepData(prev => ({
                    ...prev,
                    config: { ...prev.config, templateId: value }
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template1">Basic Document</SelectItem>
                  <SelectItem value="template2">Project Report</SelectItem>
                  <SelectItem value="template3">Meeting Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'llmProcess':
        return (
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Prompt Template</Label>
              <Textarea
                value={stepData.config.promptTemplate || ''}
                onChange={(e) => {
                  setStepData(prev => ({
                    ...prev,
                    config: { ...prev.config, promptTemplate: e.target.value }
                  }));
                }}
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label>Model</Label>
              <Select
                value={stepData.config.model || 'gpt-4'}
                onValueChange={(value) => {
                  setStepData(prev => ({
                    ...prev,
                    config: { ...prev.config, model: value }
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                  <SelectItem value="llama-3">Llama 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'apiProcess':
        return (
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>API Endpoint</Label>
              <Input
                value={stepData.config.endpoint || ''}
                onChange={(e) => {
                  setStepData(prev => ({
                    ...prev,
                    config: { ...prev.config, endpoint: e.target.value }
                  }));
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label>Method</Label>
              <Select
                value={stepData.config.method || 'GET'}
                onValueChange={(value) => {
                  setStepData(prev => ({
                    ...prev,
                    config: { ...prev.config, method: value }
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Headers (JSON)</Label>
              <Textarea
                value={JSON.stringify(stepData.config.headers || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    setStepData(prev => ({
                      ...prev,
                      config: { ...prev.config, headers }
                    }));
                  } catch (error) {
                    console.error('Error parsing headers:', error);
                  }
                }}
                rows={3}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={showStepEditor} onOpenChange={toggleStepEditor}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <StepTypeIcon type={stepData.type} />
            <span>{editingStep ? 'Edit Step' : 'Add New Step'}</span>
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={toggleStepEditor}>
            <X size={18} />
          </Button>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Step Title</Label>
              <Input 
                id="title" 
                value={stepData.title} 
                onChange={(e) => setStepData(prev => ({ ...prev, title: e.target.value }))}
                required 
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Step Type</Label>
              <Select 
                value={stepData.type} 
                onValueChange={(value: StepType) => setStepData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="form">Form Input</SelectItem>
                  <SelectItem value="createDocument">Create Document</SelectItem>
                  <SelectItem value="getDocument">Get Document</SelectItem>
                  <SelectItem value="llmProcess">LLM Process</SelectItem>
                  <SelectItem value="apiProcess">API Process</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea 
              id="description" 
              value={stepData.description} 
              onChange={(e) => setStepData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this step does" 
            />
          </div>
          
          <Tabs defaultValue="config">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="input">Input Mapping</TabsTrigger>
              <TabsTrigger value="output">Output Mapping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="config" className="p-4 border rounded-md">
              <h3 className="text-sm font-medium mb-3">Step Configuration</h3>
              {renderConfigFields()}
            </TabsContent>
            
            <TabsContent value="input" className="p-4 border rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Input Mapping</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addMappingPair('input')}
                >
                  Add Mapping
                </Button>
              </div>
              
              {Object.entries(stepData.inputMapping).map(([key, value], index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input 
                    value={key} 
                    onChange={(e) => updateMapping('input', key, e.target.value, value)}
                    placeholder="Step property"
                    className="flex-1"
                  />
                  <span className="flex items-center">←</span>
                  <Input 
                    value={value} 
                    onChange={(e) => updateMapping('input', key, key, e.target.value)}
                    placeholder="Task scope property"
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeMapping('input', key)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
              
              {Object.keys(stepData.inputMapping).length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-3">
                  No input mappings defined. Add mapping to use task scope values as input.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="output" className="p-4 border rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium">Output Mapping</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => addMappingPair('output')}
                >
                  Add Mapping
                </Button>
              </div>
              
              {Object.entries(stepData.outputMapping).map(([key, value], index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input 
                    value={key} 
                    onChange={(e) => updateMapping('output', key, e.target.value, value)}
                    placeholder="Step output property"
                    className="flex-1"
                  />
                  <span className="flex items-center">→</span>
                  <Input 
                    value={value} 
                    onChange={(e) => updateMapping('output', key, key, e.target.value)}
                    placeholder="Task scope property"
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeMapping('output', key)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
              
              {Object.keys(stepData.outputMapping).length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-3">
                  No output mappings defined. Add mapping to save step output to task scope.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={toggleStepEditor}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!stepData.title}>
            {editingStep ? 'Update Step' : 'Add Step'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StepEditor;