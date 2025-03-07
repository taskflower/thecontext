/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/ScenarioCreatorLLMEditor.tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EditorProps } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export function ScenarioCreatorLLMEditor({ step, onChange }: EditorProps) {
  const config = step.config || {};

  const updateConfig = (key: string, value: any) => {
    onChange({
      config: {
        ...config,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-6">
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

      <Separator className="my-4" />
      
      <div className="grid gap-2">
        <Label htmlFor="inputPrompt">LLM Prompt</Label>
        <Textarea 
          id="inputPrompt" 
          value={config.inputPrompt || 'Generate 3 marketing scenarios for a new product launch'} 
          onChange={(e) => updateConfig("inputPrompt", e.target.value)}
          placeholder="Describe what scenarios you want the LLM to generate"
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          The prompt sent to the LLM to generate scenarios
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="projectPrefix">Project Name Prefix</Label>
        <Input
          id="projectPrefix"
          value={config.projectPrefix || 'LLM Campaign'}
          onChange={(e) => updateConfig("projectPrefix", e.target.value)}
          placeholder="LLM Campaign"
        />
        <p className="text-xs text-muted-foreground">
          Will be used as the prefix for scenario folders
        </p>
      </div>

      <Separator className="my-4" />
      <h3 className="text-sm font-medium mb-4">Advanced Settings</h3>

      <div className="grid gap-2">
        <Label htmlFor="mockResponse" className="flex items-center justify-between">
          Use Mock Response
          <Switch
            id="mockResponse"
            checked={config.mockResponse !== false}
            onCheckedChange={(checked) => {
              updateConfig("mockResponse", checked);
            }}
          />
        </Label>
        <p className="text-xs text-muted-foreground">
          When turned on: Uses pre-defined sample response instead of calling LLM API.
          When turned off: Makes a real API call to the LLM service.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="domainContext">Domain Context</Label>
        <Select
          value={config.domainContext || 'marketing'}
          onValueChange={(value) => updateConfig("domainContext", value)}
        >
          <SelectTrigger id="domainContext">
            <SelectValue placeholder="Select a domain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="software">Software Development</SelectItem>
            <SelectItem value="productdev">Product Development</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          The domain context for the generated scenarios
        </p>
      </div>

      {config.domainContext === 'custom' && (
        <div className="grid gap-2">
          <Label htmlFor="customSystemPrompt">Custom System Prompt</Label>
          <Textarea
            id="customSystemPrompt"
            value={config.customSystemPrompt || ''}
            onChange={(e) => updateConfig("customSystemPrompt", e.target.value)}
            placeholder="You are an AI assistant specialized in..."
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            Custom system prompt to use with the LLM
          </p>
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="numberOfScenarios">Number of Scenarios</Label>
        <Select
          value={config.numberOfScenarios?.toString() || '3'}
          onValueChange={(value) => updateConfig("numberOfScenarios", parseInt(value))}
        >
          <SelectTrigger id="numberOfScenarios">
            <SelectValue placeholder="Number of scenarios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
            <SelectItem value="5">5</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          How many scenarios to generate
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="enableAutoSave" className="flex items-center justify-between">
          Auto-save Results to Documents
          <Switch
            id="enableAutoSave"
            checked={config.enableAutoSave !== false}
            onCheckedChange={(checked) => {
              updateConfig("enableAutoSave", checked);
            }}
          />
        </Label>
        <p className="text-xs text-muted-foreground">
          Automatically save LLM response to documents when scenarios are created
        </p>
      </div>
    </div>
  );
}