// src/pages/stepsPlugins/llmGenerator/LLMGeneratorEditor.tsx

import { Input, Label, Switch, Textarea } from '@/components/ui';
import { EditorProps } from '../types';

export function LLMGeneratorEditor({ step, onChange }: EditorProps) {
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
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea 
          id="systemPrompt" 
          value={step.config.systemPrompt || ''} 
          onChange={(e) => onChange({ 
            config: { ...step.config, systemPrompt: e.target.value } 
          })}
          placeholder="Instructions for the AI model"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="userPrompt">User Prompt Template</Label>
        <Textarea 
          id="userPrompt" 
          value={step.config.userPrompt || ''} 
          onChange={(e) => onChange({ 
            config: { ...step.config, userPrompt: e.target.value } 
          })}
          placeholder="Prompt to show to the user"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="temperature">Temperature: {step.config.temperature || 0.7}</Label>
        {/* <Slider 
          id="temperature"
          min={0}
          max={1}
          step={0.1}
          value={[step.config.temperature || 0.7]}
          onValueChange={(values) => onChange({
            config: { ...step.config, temperature: values[0] }
          })}
        /> */}
        ??????
        <p className="text-xs text-muted-foreground">Lower values make output more focused, higher values more creative</p>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="maxTokens">Max Tokens</Label>
        <Input 
          id="maxTokens" 
          type="number"
          min={100}
          max={4000}
          value={step.config.maxTokens || 2000} 
          onChange={(e) => onChange({ 
            config: { ...step.config, maxTokens: parseInt(e.target.value) || 2000 } 
          })}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Switch 
          id="saveAsDocument" 
          checked={step.config.saveAsDocument !== false}
          onCheckedChange={(checked) => onChange({ 
            config: { ...step.config, saveAsDocument: checked } 
          })}
        />
        <Label htmlFor="saveAsDocument">Save output as document</Label>
      </div>
    </div>
  );
}