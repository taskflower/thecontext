/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/boilerplate_reference/StepReferenceEditor.tsx
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { EditorProps } from '../types';
import { PreviousStepsSelect } from '@/components/plugins/PreviousStepsSelect';

export function StepReferenceEditor({ step, onChange }: EditorProps) {
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
      
      <PreviousStepsSelect
        stepId={step.id}
        taskId={step.taskId}
        value={config.referenceStepId || ''}
        onChange={(value) => updateConfig('referenceStepId', value)}
        label="Referenced Step"
        placeholder="Select a step"
      />
    </div>
  );
}