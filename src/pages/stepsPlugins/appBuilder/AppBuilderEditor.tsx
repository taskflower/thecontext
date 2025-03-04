// AppBuilderEditor.tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EditorProps } from '../types';

export function AppBuilderEditor({ step, onChange }: EditorProps) {
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
        <Label htmlFor="maxTasks">Maximum Tasks: {step.config.maxTasks || 5}</Label>
        <Input 
          id="maxTasks"
          type="range"
          min={1}
          max={10}
          step={1}
          value={step.config.maxTasks || 5}
          onChange={(e) => onChange({
            config: { ...step.config, maxTasks: parseInt(e.target.value) }
          })}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">Maximum number of tasks to generate in the application</p>
      </div>
    </div>
  );
}