// src/modules/plugin/components/PluginSelector.tsx
import React from 'react';
import { usePluginStore } from '../store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface PluginSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
}

export const PluginSelector: React.FC<PluginSelectorProps> = ({ 
  value, 
  onChange 
}) => {
  const { plugins, activePlugins } = usePluginStore();
  const pluginsList = Object.values(plugins);
  
  // Konwersja undefined/null/pusty string na "_none"
  const safeValue = value || "_none";
  
  // Konwersja "_none" z powrotem na undefined przy zmianie
  const handleChange = (newValue: string) => {
    onChange(newValue === "_none" ? "" : newValue);
  };
  
  return (
    <Select 
      value={safeValue}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Wybierz plugin" />
      </SelectTrigger>
      <SelectContent>
        {/* Używamy "_none" zamiast pustego stringa */}
        <SelectItem value="_none">Brak pluginu</SelectItem>
        
        {pluginsList.map(plugin => {
          const isActive = activePlugins.includes(plugin.id);
          
          return (
            <SelectItem key={plugin.id} value={plugin.id}>
              <div className="flex items-center justify-between w-full">
                <span>{plugin.name}</span>
                <Badge variant={isActive ? "default" : "outline"} className="ml-2">
                  {isActive ? "Aktywny" : "Nieaktywny"}
                </Badge>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};