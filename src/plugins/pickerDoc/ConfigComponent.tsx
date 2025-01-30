// src/plugins/pickerDoc/ConfigComponent.tsx
import React from 'react';
import { PluginConfigProps } from '../base';

export const ConfigComponent: React.FC<PluginConfigProps> = ({
 
  onStatusChange,
}) => {
  // Since we don't have any configuration, we'll just set it as always valid
  React.useEffect(() => {
    onStatusChange(true);
  }, [onStatusChange]);

  return null;
};
