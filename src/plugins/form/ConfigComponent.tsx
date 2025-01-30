// src/plugins/form/ConfigComponent.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormConfig } from './types';
import { PluginConfigProps } from '../base';

// Create a type-safe wrapper component
export const ConfigComponent: React.FC<PluginConfigProps> = ({
  config,
  onConfigChange,
  onStatusChange,
}) => {
  // Cast the generic config to your specific type
  const formConfig = config as FormConfig;
  
  const validateConfig = (newConfig: FormConfig) => {
    const isValid = !!newConfig.question;
    onStatusChange(isValid);
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfig = {
      ...formConfig,
      question: e.target.value,
    };
    onConfigChange(newConfig);
    validateConfig(newConfig);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Question</Label>
        <Input
          value={formConfig.question || ""}
          onChange={handleQuestionChange}
          placeholder="Enter the question..."
        />
      </div>
      <div className="space-y-2">
        <Label>Validation</Label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formConfig.required}
              onChange={(e) => {
                const newConfig = {
                  ...formConfig,
                  required: e.target.checked,
                };
                onConfigChange(newConfig);
                validateConfig(newConfig);
              }}
            />
            <span>Required</span>
          </label>
          <div className="flex items-center space-x-2">
            <span>Min length:</span>
            <Input
              type="number"
              className="w-20"
              value={formConfig.minLength || 0}
              onChange={(e) => {
                const newConfig = {
                  ...formConfig,
                  minLength: parseInt(e.target.value),
                };
                onConfigChange(newConfig);
                validateConfig(newConfig);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};