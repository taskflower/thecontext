/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/llmResponse/LLMResponseEditor.tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EditorProps } from '../types';

export function LLMResponseEditor({ step, onChange }: EditorProps) {
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
        <Label htmlFor="promptTemplate">Prompt Template</Label>
        <Textarea 
          id="promptTemplate" 
          value={config.promptTemplate || ''} 
          onChange={(e) => updateConfig('promptTemplate', e.target.value)}
          placeholder="Generate {{type}} about {{topic}}"
        />
        <p className="text-xs text-muted-foreground">
          Use &#123;&#123;variable&#125;&#125; syntax to insert data from previous steps
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="mockResponse"
          checked={config.mockResponse === true}
          onCheckedChange={(checked) => updateConfig('mockResponse', checked)}
        />
        <Label htmlFor="mockResponse">Use Mock Response (for testing)</Label>
      </div>
      
      <div className="grid gap-2">
        <Label>Response Format</Label>
        <RadioGroup 
          value={config.responseSampleType || 'json'} 
          onValueChange={(value) => updateConfig('responseSampleType', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="json" id="json" />
            <Label htmlFor="json">JSON</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="text" id="text" />
            <Label htmlFor="text">Text</Label>
          </div>
        </RadioGroup>
      </div>
      
      {config.mockResponse === true && (
        <div className="grid gap-2">
          <Label htmlFor="responseSample">Sample Response</Label>
          <Textarea 
            id="responseSample" 
            value={config.responseSample || ''} 
            onChange={(e) => updateConfig('responseSample', e.target.value)}
            className="font-mono text-xs min-h-[200px]"
          />
        </div>
      )}
    </div>
  );
}