/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/ScenarioCreatorLLMEditor.tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { EditorProps } from '../types';

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

      <div className="grid gap-2">
        <Label htmlFor="mockResponse" className="flex items-center justify-between">
          Use Mock Response
          <Switch
            id="mockResponse"
            checked={config.mockResponse !== false}
            onCheckedChange={(checked) => {
              console.log("Setting mockResponse to:", checked);
              updateConfig("mockResponse", checked);
            }}
          />
        </Label>
        <p className="text-xs text-muted-foreground">
          When turned on: Uses pre-defined sample response instead of calling LLM API.
          When turned off: Makes a real API call to the LLM service.
        </p>
      </div>
    </div>
  );
}