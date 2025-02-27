// Add to src/pages/tasks/TaskFlow/steps/components/StepsList.tsx

import React from "react";
import { Plus, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepFormData } from "../useStepsForm";
import { getPluginsList } from "../../stepsPlugins/registry";
import { StepType } from "../../types";
import StepConfigPanel from "./StepConfigPanel";


interface StepsListProps {
  steps: StepFormData[];
  onAddStep: () => void;
  onUpdateStep?: (index: number, updates: Partial<StepFormData>) => void;
  onRemoveStep?: (index: number) => void;
  onMoveStep?: (index: number, direction: 'up' | 'down') => void;
}

const StepsList: React.FC<StepsListProps> = ({ 
  steps, 
  onAddStep,
  onUpdateStep,
  onRemoveStep,
  onMoveStep
}) => {
  // Get list of available plugins
  const pluginsList = getPluginsList();
  
  // Debug: Log the plugins list to see what's available
  console.log("Available plugins:", pluginsList);
  
  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium">Task Steps</h3>
        <Button onClick={onAddStep} size="sm" variant="outline">
          <Plus size={14} className="mr-1" />
          Add Step
        </Button>
      </div>
      
      {/* Debug: Show plugin list status */}
      {pluginsList.length === 0 && (
        <div className="p-4 border border-yellow-400 bg-yellow-50 rounded mb-3 text-sm">
          <strong>Debug:</strong> No plugins available. The plugin registry is empty.
        </div>
      )}
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="border rounded-lg p-3">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 mr-2">
                <Input
                  value={step.title}
                  onChange={(e) => onUpdateStep?.(index, { title: e.target.value })}
                  placeholder="Step title"
                  className="mb-2"
                />
                <Textarea
                  value={step.description}
                  onChange={(e) => onUpdateStep?.(index, { description: e.target.value })}
                  placeholder="Step description"
                  className="h-16 text-sm"
                />
              </div>
              <div className="flex flex-col items-end">
                <Select 
                  value={step.type} 
                  onValueChange={(value) => onUpdateStep?.(index, { type: value as StepType })}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pluginsList.length > 0 ? (
                      pluginsList.map((plugin) => (
                        <SelectItem key={plugin.type} value={plugin.type}>
                          {plugin.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="form">Form Step</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                <div className="flex mt-2">
                  {onMoveStep && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onMoveStep(index, 'up')}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ArrowUp size={16} />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onMoveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                        title="Move down"
                      >
                        <ArrowDown size={16} />
                      </Button>
                    </>
                  )}
                  
                  {onRemoveStep && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onRemoveStep(index)} 
                      disabled={steps.length <= 1}
                      title="Remove step"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Badge variant="outline" className="mr-2">{step.type}</Badge>
              <span>Step {index + 1} of {steps.length}</span>
            </div>
            
            {/* Step Configuration Panel */}
            <StepConfigPanel 
              step={step}
              onChange={(updates) => onUpdateStep?.(index, updates)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsList;