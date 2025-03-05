/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreator/ScenarioCreatorEditor.tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EditorProps } from '../types';
import { Switch } from '@/components/ui/switch';

export function ScenarioCreatorEditor({ step, onChange }: EditorProps) {
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
        <Label htmlFor="mockData">Use Mock Data</Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="mockData"
            checked={config.useMockData !== false}
            onCheckedChange={(checked) => updateConfig("useMockData", checked)}
          />
          <span className="text-sm text-muted-foreground">
            Use pre-defined sample scenarios
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="projectPrefix">Project Name Prefix</Label>
        <Input
          id="projectPrefix"
          value={config.projectPrefix || 'Marketing Campaign'}
          onChange={(e) => updateConfig("projectPrefix", e.target.value)}
          placeholder="Marketing Campaign"
        />
        <p className="text-xs text-muted-foreground">Will be used as the prefix for scenario folders</p>
      </div>
    </div>
  );
}