// src/modules/plugin/components/PluginOptions.tsx
import React from 'react';
import { usePluginStore } from '../store';
import { Plugin } from '../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PluginOptionsProps {
  pluginId: string;
  value: Record<string, any>;
  onChange: (options: Record<string, any>) => void;
}

export const PluginOptions: React.FC<PluginOptionsProps> = ({
  pluginId,
  value,
  onChange
}) => {
  const { plugins } = usePluginStore();
  const plugin = plugins[pluginId];
  
  if (!plugin || !plugin.options?.length) {
    return (
      <div className="text-muted-foreground text-sm py-2">
        Ten plugin nie ma konfigurowalnych opcji.
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Opcje pluginu: {plugin.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {plugin.options.map(option => (
          <OptionField
            key={option.id}
            option={option}
            value={value[option.id] ?? option.default}
            onChange={(newValue) => {
              onChange({
                ...value,
                [option.id]: newValue
              });
            }}
          />
        ))}
      </CardContent>
    </Card>
  );
};

// Komponent dla pojedynczej opcji
const OptionField = ({ option, value, onChange }) => {
  switch (option.type) {
    case 'text':
      return (
        <div className="space-y-2">
          <Label htmlFor={option.id}>{option.label}</Label>
          <Input
            id={option.id}
            value={value || ''}
            onChange={e => onChange(e.target.value)}
          />
        </div>
      );
      
    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={option.id}>{option.label}</Label>
          <Input
            id={option.id}
            type="number"
            value={value || 0}
            onChange={e => onChange(Number(e.target.value))}
          />
        </div>
      );
      
    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={option.id}
            checked={!!value}
            onCheckedChange={onChange}
          />
          <Label htmlFor={option.id}>{option.label}</Label>
        </div>
      );
      
    case 'select':
      return (
        <div className="space-y-2">
          <Label htmlFor={option.id}>{option.label}</Label>
          <Select
            value={String(value) || ''}
            onValueChange={onChange}
          >
            <SelectTrigger id={option.id}>
              <SelectValue placeholder={`Wybierz ${option.label}`} />
            </SelectTrigger>
            <SelectContent>
              {option.options?.map(opt => (
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
};