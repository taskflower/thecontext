// src/plugins/generateDoc/ConfigComponent.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenerateDocConfig } from './types';
import { PluginConfigProps } from '../base';

export const ConfigComponent: React.FC<PluginConfigProps> = ({
  config,
  onConfigChange,
  onStatusChange,
}) => {
  const generateDocConfig = config as GenerateDocConfig;
  
  const validateConfig = (newConfig: GenerateDocConfig) => {
    const isValid = !!newConfig.documentName && !!newConfig.containerName;
    onStatusChange(isValid);
  };

  const handleConfigChange = (field: keyof GenerateDocConfig, value: string) => {
    const newConfig = {
      ...generateDocConfig,
      [field]: value,
    };
    onConfigChange(newConfig);
    validateConfig(newConfig);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Document Name</Label>
        <Input
          value={generateDocConfig.documentName || ""}
          onChange={(e) => handleConfigChange('documentName', e.target.value)}
          placeholder="Enter document name..."
        />
      </div>
      <div className="space-y-2">
        <Label>Container Name</Label>
        <Input
          value={generateDocConfig.containerName || ""}
          onChange={(e) => handleConfigChange('containerName', e.target.value)}
          placeholder="Enter container name..."
        />
      </div>
    </div>
  );
};