/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/workspaces_module/components/CreateWorkspaceForm.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { WorkspaceType } from '../workspaceStore';
import { getContextIconComponent } from './contextIconService';
import ContextKeyIconSelector from './ContextKeyIconSelector';

export const CreateWorkspaceForm = ({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (name: string, type: WorkspaceType, typeIcon: string, description: string, initialContext: Record<string, any>) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<WorkspaceType>('');
  const [typeIcon, setTypeIcon] = useState('box');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [audience, setAudience] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  
  const handleSubmit = () => {
    const initialContext: Record<string, any> = {};
    
    if (url) initialContext.url = url;
    if (audience) initialContext.audience = audience;
    if (businessGoal) initialContext.businessGoal = businessGoal;
    
    onSubmit(name, type, typeIcon, description, initialContext);
  };
  
  // Get the appropriate icon component for each context field
  const Globe = getContextIconComponent('url');
  const Users = getContextIconComponent('audience');
  const Target = getContextIconComponent('businessGoal');
  
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Workspace Name</Label>
        <Input 
          id="workspaceName"
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., MySiteAnalytics" 
          autoFocus
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="workspaceType">Workspace Type</Label>
        <Input 
          id="workspaceType"
          value={type} 
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g., Website, Business, Marketing" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="typeIcon">Type Icon</Label>
        <ContextKeyIconSelector
          selectedIcon={typeIcon}
          onSelectIcon={setTypeIcon}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea 
          id="description"
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this workspace" 
          className="min-h-20" 
        />
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
          <span>Initial Context</span>
          <Badge variant="outline" className="font-normal text-xs">Optional</Badge>
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              <span>Website URL</span>
            </Label>
            <Input 
              id="url"
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="audience" className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-purple-500" />
              <span>Target Audience</span>
            </Label>
            <Input 
              id="audience"
              value={audience} 
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g., Men 30-45, interested in sports" 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="businessGoal" className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-amber-500" />
              <span>Business Goal</span>
            </Label>
            <Input 
              id="businessGoal"
              value={businessGoal} 
              onChange={(e) => setBusinessGoal(e.target.value)}
              placeholder="e.g., Increase form conversions by 20%" 
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!name || !type}>
          Create Workspace
        </Button>
      </div>
    </div>
  );
};

export default CreateWorkspaceForm;