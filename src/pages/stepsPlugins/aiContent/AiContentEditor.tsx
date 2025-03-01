/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/aiContent/AiContentEditor.tsx

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EditorProps } from "../types";

export default function AiContentEditor({ step, onChange }: EditorProps) {
  const config = step.config || {};
  
  function updateConfig(updates: Record<string, any>) {
    onChange({ 
      config: { ...config, ...updates }
    });
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Generation Title</Label>
        <Input
          id="title"
          value={config.title || step.title || 'AI Content Generator'}
          onChange={(e) => updateConfig({ title: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={config.description || step.description || 'Generate content using AI'}
          onChange={(e) => updateConfig({ description: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="promptTemplate">Prompt Template</Label>
        <Textarea
          id="promptTemplate"
          className="min-h-32 font-mono text-sm"
          value={config.promptTemplate || ''}
          onChange={(e) => updateConfig({ promptTemplate: e.target.value })}
          placeholder="Enter your prompt template..."
        />
        <p className="text-xs text-muted-foreground">
          Use double curly braces for variables (example: taskId, stepId, projectId)
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          className="min-h-24 font-mono text-sm"
          value={config.systemPrompt || 'You are a helpful assistant.'}
          onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="outputFormat">Output Format</Label>
        <Select
          value={config.outputFormat || 'markdown'}
          onValueChange={(value) => updateConfig({ outputFormat: value })}
        >
          <SelectTrigger id="outputFormat">
            <SelectValue placeholder="Select output format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
            <SelectItem value="plaintext">Plain Text</SelectItem>
            <SelectItem value="json">JSON</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="maxTokens">Max Tokens</Label>
        <Input
          id="maxTokens"
          type="number"
          min="100"
          max="4000"
          value={config.maxTokens || 1000}
          onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) || 1000 })}
        />
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Switch
          id="storeAsDocument"
          checked={config.storeAsDocument ?? true}
          onCheckedChange={(checked) => updateConfig({ storeAsDocument: checked })}
        />
        <Label htmlFor="storeAsDocument">Store as document</Label>
      </div>
      
      <div className="flex items-center space-x-2 mt-4">
        <Switch
          id="allowRetry"
          checked={config.allowRetry ?? true}
          onCheckedChange={(checked) => updateConfig({ allowRetry: checked })}
        />
        <Label htmlFor="allowRetry">Allow regeneration</Label>
      </div>
    </div>
  );
}