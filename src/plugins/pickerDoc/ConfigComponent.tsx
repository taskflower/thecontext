// src/plugins/pickerDoc/ConfigComponent.tsx
import React from 'react';
import { PluginConfigProps } from '../base';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PickerDocConfig } from './types';

export const ConfigComponent: React.FC<PluginConfigProps> = ({
  config,
  onConfigChange,
  onStatusChange,
}) => {
  const pickerConfig = config as PickerDocConfig;

  // Configuration is always valid
  React.useEffect(() => {
    onStatusChange(true);
  }, [onStatusChange]);

  const handleSystemMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newConfig = {
      ...pickerConfig,
      systemLLMMessage: e.target.value,
    };
    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>System LLM Message</Label>
        <Textarea
          value={pickerConfig?.systemLLMMessage || ""}
          onChange={handleSystemMessageChange}
          placeholder="Enter the system message for LLM..."
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};