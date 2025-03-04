// src/pages/stepsPlugins/documentEditor/DocumentEditorEditor.tsx
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { EditorProps } from '../types';
import { useDataStore } from '@/store';

export function DocumentEditorEditor({ step, onChange }: EditorProps) {
  const [newTag, setNewTag] = useState('');
  const { folders } = useDataStore();
  
  // Get all folders for the selector
  const getFolderOptions = () => {
    return folders.map(folder => ({
      id: folder.id,
      name: folder.name
    }));
  };
  
  // Add a tag
  const addTag = () => {
    if (newTag.trim() && !step.config.tags?.includes(newTag.trim())) {
      const updatedTags = [...(step.config.tags || []), newTag.trim()];
      onChange({ 
        config: { ...step.config, tags: updatedTags } 
      });
      setNewTag('');
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    const updatedTags = (step.config.tags || []).filter(tag => tag !== tagToRemove);
    onChange({ 
      config: { ...step.config, tags: updatedTags } 
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
        <Label htmlFor="documentTitle">Default Document Title</Label>
        <Input 
          id="documentTitle" 
          value={step.config.documentTitle || ''} 
          onChange={(e) => onChange({ 
            config: { ...step.config, documentTitle: e.target.value } 
          })}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="documentType">Document Type</Label>
        <Select
          value={step.config.documentType || 'markdown'}
          onValueChange={(value) => onChange({
            config: { ...step.config, documentType: value }
          })}
        >
          <SelectTrigger id="documentType">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="plaintext">Plain Text</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="initialContent">Initial Content</Label>
        <Textarea 
          id="initialContent" 
          value={step.config.initialContent || ''} 
          onChange={(e) => onChange({ 
            config: { ...step.config, initialContent: e.target.value } 
          })}
          className="min-h-32"
          placeholder="# Document Title

## Introduction
Start writing your document here...

## Section 1
Add your content...

## Conclusion
Summarize your main points..."
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="saveDocumentToFolder">Save Document To Folder</Label>
        <Select
          value={step.config.saveDocumentToFolder || 'root'}
          onValueChange={(value) => onChange({
            config: { ...step.config, saveDocumentToFolder: value }
          })}
        >
          <SelectTrigger id="saveDocumentToFolder">
            <SelectValue placeholder="Select folder" />
          </SelectTrigger>
          <SelectContent>
            {getFolderOptions().map(folder => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label>Default Tags</Label>
        <div className="flex flex-wrap gap-1 p-2 border rounded-md">
          {(step.config.tags || []).map(tag => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="flex items-center gap-1"
            >
              {tag}
              <button 
                onClick={() => removeTag(tag)}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-muted"
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
          <div className="flex items-center gap-1">
            <Input 
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag..."
              className="h-8 text-sm"
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button variant="outline" size="sm" className="h-8" onClick={addTag}>
              <Plus size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch 
          id="enableAIAssistance" 
          checked={step.config.enableAIAssistance !== false}
          onCheckedChange={(checked) => onChange({ 
            config: { ...step.config, enableAIAssistance: checked } 
          })}
        />
        <Label htmlFor="enableAIAssistance">Enable AI assistance</Label>
      </div>
    </div>
  );
}