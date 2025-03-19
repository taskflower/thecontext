/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/components/PluginOptions.tsx
import React from 'react';
import { usePluginStore } from '../store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PluginOption } from '../types';

interface PluginOptionsProps {
  pluginId: string;
  value: Record<string, any>;
  onChange: (options: Record<string, any>) => void;
  disabled?: boolean;
}

export const PluginOptions: React.FC<PluginOptionsProps> = React.memo(({
  pluginId,
  value,
  onChange,
  disabled = false
}) => {
  const { plugins } = usePluginStore();
  const plugin = plugins[pluginId];
  
  if (!plugin || !plugin.options?.length) {
    return (
      <div className="text-muted-foreground text-sm py-2">
        This plugin has no configurable options.
      </div>
    );
  }
  
  // Handle single option change
  const handleOptionChange = (optionId: string, optionValue: any) => {
    onChange({
      ...value,
      [optionId]: optionValue
    });
  };
  
  return (
    <div className="space-y-4">
      <Separator className="my-2" />
      
      {plugin.options.map(option => (
        <OptionField
          key={option.id}
          option={option}
          value={value[option.id] ?? option.default}
          onChange={(newValue) => handleOptionChange(option.id, newValue)}
          disabled={disabled}
        />
      ))}
    </div>
  );
});

// Component for rendering a single option field based on its type
interface OptionFieldProps {
  option: PluginOption;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}

const OptionField: React.FC<OptionFieldProps> = React.memo(({ 
  option, 
  value, 
  onChange,
  disabled = false
}) => {
  switch (option.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label htmlFor={`option-${option.id}`}>{option.label}</Label>
          <Input
            id={`option-${option.id}`}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            disabled={disabled}
          />
        </div>
      );
      
    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={`option-${option.id}`}>{option.label}</Label>
          <Input
            id={`option-${option.id}`}
            type="number"
            value={value ?? 0}
            onChange={e => onChange(Number(e.target.value))}
            disabled={disabled}
          />
        </div>
      );
      
    case 'boolean':
      return (
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor={`option-${option.id}`}>{option.label}</Label>
          <Switch
            id={`option-${option.id}`}
            checked={!!value}
            onCheckedChange={onChange}
            disabled={disabled}
          />
        </div>
      );
      
    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={`option-${option.id}`}>{option.label}</Label>
          <Select
            value={String(value ?? '')}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger id={`option-${option.id}`}>
              <SelectValue placeholder={`Select ${option.label}`} />
            </SelectTrigger>
            <SelectContent>
              {option.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
      
    default:
      return null;
  }
});

OptionField.displayName = 'OptionField';
PluginOptions.displayName = 'PluginOptions';