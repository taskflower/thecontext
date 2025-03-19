// src/modules/plugin/components/PluginSelector.tsx
import React, { useMemo } from 'react';
import { usePluginStore } from '../store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ensurePluginsLoaded } from '../loader';

interface PluginSelectorProps {
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const PluginSelector: React.FC<PluginSelectorProps> = React.memo(({ 
  value, 
  onChange,
  disabled = false,
  placeholder = "Select plugin" 
}) => {
  const { plugins, activePlugins } = usePluginStore();
  
  // Ensure plugins are loaded
  React.useEffect(() => {
    ensurePluginsLoaded();
  }, []);
  
  // Memoize sorted plugins list
  const pluginsList = useMemo(() => {
    return Object.values(plugins).sort((a, b) => a.name.localeCompare(b.name));
  }, [plugins]);
  
  // Convert undefined/null/empty string to "_none"
  const safeValue = value || "_none";
  
  // Convert "_none" back to empty string on change
  const handleChange = (newValue: string) => {
    onChange(newValue === "_none" ? "" : newValue);
  };
  
  return (
    <Select 
      value={safeValue}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_none">No plugin</SelectItem>
        
        {pluginsList.map(plugin => {
          const isActive = activePlugins.includes(plugin.id);
          
          return (
            <SelectItem key={plugin.id} value={plugin.id}>
              <div className="flex items-center justify-between w-full pr-4">
                <span>{plugin.name}</span>
                {isActive && (
                  <Badge variant="default" className="ml-2 text-xs">
                    Active
                  </Badge>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
});

PluginSelector.displayName = 'PluginSelector';