/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/document/DocumentEditor.tsx

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditorProps } from "../types";

export default function DocumentEditor({ step, onChange }: EditorProps) {
  const config = step.config || {};
  
  function updateConfig(updates: Record<string, any>) {
    onChange({ 
      config: { ...config, ...updates }
    });
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Document Title</Label>
        <Input
          id="title"
          value={config.title || step.title || ''}
          onChange={(e) => updateConfig({ title: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={config.description || step.description || ''}
          onChange={(e) => updateConfig({ description: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="format">Format</Label>
        <Select
          value={config.format || 'markdown'}
          onValueChange={(value) => updateConfig({ format: value })}
        >
          <SelectTrigger id="format">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="plaintext">Plain Text</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="template">Default Template (optional)</Label>
        <Textarea
          id="template"
          className="min-h-32"
          value={config.template || ''}
          onChange={(e) => updateConfig({ template: e.target.value })}
          placeholder="Enter a default template for users to start with..."
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minLength">Minimum Length (characters)</Label>
          <Input
            id="minLength"
            type="number"
            min="0"
            value={config.minLength || 0}
            onChange={(e) => updateConfig({ minLength: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxLength">Maximum Length (characters)</Label>
          <Input
            id="maxLength"
            type="number"
            min="0"
            value={config.maxLength || 10000}
            onChange={(e) => updateConfig({ maxLength: parseInt(e.target.value) || 10000 })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="suggestions">Suggestions (one per line)</Label>
        <Textarea
          id="suggestions"
          className="min-h-24"
          value={(config.suggestions || []).join('\n')}
          onChange={(e) => updateConfig({ suggestions: e.target.value.split('\n').filter(Boolean) })}
          placeholder="Enter suggestions or prompts to help users complete this document..."
        />
      </div>
    </div>
  );
}