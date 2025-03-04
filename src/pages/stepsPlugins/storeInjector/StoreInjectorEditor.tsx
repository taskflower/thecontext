// src/pages/stepsPlugins/storeInjector/StoreInjectorEditor.tsx - FIXED VERSION
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusCircle, X, AlertTriangle } from 'lucide-react';
import { EditorProps } from '../types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAllPlugins } from '../registry';
import { useStepStore } from '@/store/stepStore';

export function StoreInjectorEditor({ step, onChange }: EditorProps) {
  const config = step.config || {};
  const [newField, setNewField] = useState('');
  const [sourceSteps, setSourceSteps] = useState<{id: string, title: string}[]>([]);
  const stepStore = useStepStore();
  
  const [responseTemplates, setResponseTemplates] = useState<{[key: string]: string}>({
    'scenarios': 'response.scenarios',
    'tasks': 'response.tasks',
    'steps': 'response.steps',
    'documents': 'response.documents'
  });
  
  const updateConfig = (key: string, value: any) => {
    onChange({
      config: {
        ...config,
        [key]: value
      }
    });
  };
  
  // Dynamically fetch steps from the step store
  useEffect(() => {
    if (step.taskId) {
      // Get all steps for this task
      const taskSteps = stepStore.getTaskSteps(step.taskId);
      
      // Filter for LLM Response steps or other relevant step types
      const relevantSteps = taskSteps
        .filter(s => s.id !== step.id) // Don't include current step
        .map(s => ({
          id: s.id,
          title: s.title
        }));
      
      setSourceSteps(relevantSteps);
    }
  }, [step.taskId, step.id, stepStore]);
  
  // Auto-update itemsPath when entityType changes
  useEffect(() => {
    if (config.entityType && responseTemplates[config.entityType]) {
      updateConfig('itemsPath', responseTemplates[config.entityType]);
    }
  }, [config.entityType]);
  
  // Match store method to entity type
  useEffect(() => {
    if (config.entityType) {
      const methodMap: {[key: string]: string} = {
        'scenario': 'addScenario',
        'task': 'addTask',
        'step': 'addStep',
        'document': 'addDocItem'
      };
      
      if (methodMap[config.entityType] && config.storeMethod !== methodMap[config.entityType]) {
        updateConfig('storeMethod', methodMap[config.entityType]);
      }
    }
  }, [config.entityType]);
  
  // Suggest preview fields based on entity type
  useEffect(() => {
    if (config.entityType && !config.previewFields?.length) {
      const fieldMap: {[key: string]: string[]} = {
        'scenario': ['title', 'description', 'objective'],
        'task': ['title', 'description', 'priority', 'dueDate'],
        'step': ['title', 'description', 'type'],
        'document': ['title', 'content', 'metaKeys']
      };
      
      if (fieldMap[config.entityType]) {
        updateConfig('previewFields', fieldMap[config.entityType]);
      }
    }
  }, [config.entityType]);
  
  const addPreviewField = () => {
    if (!newField.trim()) return;
    
    const currentFields = config.previewFields || [];
    if (!currentFields.includes(newField)) {
      updateConfig('previewFields', [...currentFields, newField]);
    }
    setNewField('');
  };
  
  const removePreviewField = (field: string) => {
    const currentFields = config.previewFields || [];
    updateConfig('previewFields', currentFields.filter(f => f !== field));
  };
  
  // Get all LLM response plugins
  const llmPlugins = getAllPlugins().filter(p => 
    p.type === 'llm-response'
  );
  
  // Check if selected source step is an LLM step
  const selectedStep = sourceSteps.find(s => s.id === config.sourceStep);
  const isLLMSourceConfigured = selectedStep && 
                                stepStore.getStepById(config.sourceStep)?.type === 'llm-response';
  
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Step Title</Label>
        <Input 
          id="title" 
          value={step.title || ''} 
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Step Description</Label>
        <Textarea 
          id="description" 
          value={step.description || ''} 
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="entityType">Entity Type</Label>
        <Select 
          value={config.entityType || 'scenario'} 
          onValueChange={(value) => updateConfig('entityType', value)}
        >
          <SelectTrigger id="entityType">
            <SelectValue placeholder="Select entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scenario">Scenario</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="step">Step</SelectItem>
            <SelectItem value="document">Document</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="sourceStep">Source Step</Label>
        <Select 
          value={config.sourceStep || ''} 
          onValueChange={(value) => updateConfig('sourceStep', value)}
        >
          <SelectTrigger id="sourceStep">
            <SelectValue placeholder="Select source step" />
          </SelectTrigger>
          <SelectContent>
            {sourceSteps.length === 0 ? (
              <SelectItem value="" disabled>No steps available</SelectItem>
            ) : (
              sourceSteps.map(step => (
                <SelectItem key={step.id} value={step.id}>
                  {step.title}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This should be the LLM Response step that generates your {config.entityType || 'data'}
        </p>
      </div>
      
      {!isLLMSourceConfigured && config.sourceStep && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            For best results, select an LLM Response step as your data source
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-2">
        <Label htmlFor="itemsPath">Response Path</Label>
        <Select 
          value={config.itemsPath || responseTemplates[config.entityType] || ''} 
          onValueChange={(value) => updateConfig('itemsPath', value)}
        >
          <SelectTrigger id="itemsPath">
            <SelectValue placeholder="Select path to items" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="response">response (root)</SelectItem>
            <SelectItem value="response.scenarios">response.scenarios</SelectItem>
            <SelectItem value="response.tasks">response.tasks</SelectItem>
            <SelectItem value="response.steps">response.steps</SelectItem>
            <SelectItem value="response.documents">response.documents</SelectItem>
            <SelectItem value="response.data">response.data</SelectItem>
            <SelectItem value="response.items">response.items</SelectItem>
            <SelectItem value="response.content">response.content</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Path to the array of {config.entityType || 'items'} in the LLM response
        </p>
      </div>
      
      <div className="grid gap-2">
        <Label>Preview Fields</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {(config.previewFields || []).map((field: string) => (
            <div key={field} className="bg-muted text-muted-foreground px-3 py-1 rounded-full flex items-center text-xs">
              {field}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1" 
                onClick={() => removePreviewField(field)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Input 
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            placeholder="Add field name"
            className="flex-1"
          />
          <Button onClick={addPreviewField} size="sm">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="confirmRequired"
          checked={config.confirmRequired !== false}
          onCheckedChange={(checked) => updateConfig('confirmRequired', checked)}
        />
        <Label htmlFor="confirmRequired">Require user confirmation</Label>
      </div>

      <div className="border-t pt-4 mt-4">
        <details className="text-sm">
          <summary className="font-medium cursor-pointer">Advanced Options</summary>
          <div className="mt-4 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="storeMethod">Store Method</Label>
              <Input 
                id="storeMethod" 
                value={config.storeMethod || `add${config.entityType?.charAt(0).toUpperCase()}${config.entityType?.slice(1)}` || 'addScenario'} 
                onChange={(e) => updateConfig('storeMethod', e.target.value)}
                readOnly
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dataTransformer">Data Transformer (JavaScript)</Label>
              <Textarea 
                id="dataTransformer" 
                value={config.dataTransformer || ''} 
                onChange={(e) => updateConfig('dataTransformer', e.target.value)}
                placeholder="items => items.map(item => ({ ...item }))"
                className="font-mono text-xs"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                JavaScript function to transform data before injection (advanced)
              </p>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}