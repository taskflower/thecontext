// src/plugins/pickerDoc/ConfigComponent.tsx
import React from 'react';
import { PluginConfigProps } from '../base';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PickerDocConfig } from './types';
import { useDocumentsStore } from "@/store/documentsStore";

export const ConfigComponent: React.FC<PluginConfigProps> = ({
  config,
  onConfigChange,
  onStatusChange,
}) => {
  const pickerConfig = config as PickerDocConfig;
  const { containers } = useDocumentsStore();

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

  const handleContainerChange = (value: string) => {
    const newConfig = {
      ...pickerConfig,
      containerId: value,
    };
    onConfigChange(newConfig);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Container</Label>
        <Select
          value={pickerConfig?.containerId || "all"}
          onValueChange={handleContainerChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a container..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All containers</SelectItem>
            {containers.map((container) => (
              <SelectItem key={container.id} value={container.id}>
                {container.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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