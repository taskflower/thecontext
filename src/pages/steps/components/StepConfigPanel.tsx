/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/steps/components/StepConfigPanel.tsx

import { getPlugin } from "@/pages/stepsPlugins";
import { StepFormData } from "../useStepsForm";
import { DynamicForm } from "./DynamicForm";

interface StepConfigPanelProps {
  step: StepFormData;
  onChange: (updates: Partial<StepFormData>) => void;
}

const StepConfigPanel: React.FC<StepConfigPanelProps> = ({ step, onChange }) => {
  // Get plugin schema for this step type
  const plugin = getPlugin(step.type);
  
  if (!plugin) {
    return <div className="text-sm text-red-500">Unknown step type: {step.type}</div>;
  }
  
  // Create a filtered config object that excludes title and description
  // since those are already handled at the step level
  const filteredConfig = { ...plugin.defaultConfig };
  delete filteredConfig.title;
  delete filteredConfig.description;
  
  // Handle config change
  const handleConfigChange = (field: string, value: any) => {
    // Skip updates for title and description at the plugin config level
    if (field === 'title' || field === 'description') return;
    
    onChange({ 
      config: { 
        ...step.config, 
        [field]: value 
      } 
    });
  };
  
  // Handle options change
  const handleOptionsChange = (field: string, value: any) => {
    onChange({ 
      options: { 
        ...step.options, 
        [field]: value 
      } 
    });
  };
  
  return (
    <div className="space-y-4 mt-4 border-t pt-4">
      <div className="mb-2">
        <h4 className="text-sm font-medium">Configuration</h4>
        <DynamicForm 
          schema={filteredConfig} 
          values={step.config} 
          onChange={handleConfigChange}
        />
      </div>
      
      <div className="mb-2">
        <h4 className="text-sm font-medium">Options</h4>
        <DynamicForm 
          schema={plugin.defaultOptions} 
          values={step.options} 
          onChange={handleOptionsChange}
        />
      </div>
    </div>
  );
};

export default StepConfigPanel;