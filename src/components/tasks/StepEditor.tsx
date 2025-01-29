import { Step } from '@/types/template';
import { FC, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { plugins } from '@/plugins';

interface StepEditorProps {
  step?: Step;
  onSubmit: (step: Step) => void;
}

export const StepEditor: FC<StepEditorProps> = ({ step, onSubmit }) => {
  const [stepData, setStepData] = useState<Omit<Step, 'id' | 'data'> & { question: string }>({
    name: step?.name || '',
    description: step?.description || '',
    pluginId: step?.pluginId || 'form',
    question: step?.data.question || ''
  });

  const handleSubmit = () => {
    onSubmit({
      id: step?.id || Date.now().toString(),
      ...stepData,
      data: {
        question: stepData.question,
        answer: step?.data.answer || '',
        role: 'user'
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Step Name</Label>
        <Input
          value={stepData.name}
          onChange={e => setStepData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter step name"
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          value={stepData.description}
          onChange={e => setStepData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter description"
        />
      </div>

      <div className="space-y-2">
        <Label>Plugin Type</Label>
        <Select 
          value={stepData.pluginId}
          onValueChange={(value) => setStepData(prev => ({ ...prev, pluginId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select plugin type" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(plugins).map(plugin => (
              <SelectItem key={plugin.id} value={plugin.id}>
                {plugin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Question</Label>
        <Input
          value={stepData.question}
          onChange={e => setStepData(prev => ({ ...prev, question: e.target.value }))}
          placeholder="Enter question"
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          className="w-full"
        >
          {step ? 'Update' : 'Add'} Step
        </Button>
      </div>
    </div>
  );
};