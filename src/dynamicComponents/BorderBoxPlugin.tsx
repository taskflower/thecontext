// src/dynamicComponents/SimpleBorderPlugin.tsx
import React from 'react';
import { PluginComponentProps } from '../modules/plugins/types';

// Define the structure of our plugin data
interface SimpleBorderData {
  borderColor: string;
}

// Define default values
const defaultData: SimpleBorderData = {
  borderColor: '#3b82f6', // blue-500
};

const SimpleBorderPlugin: React.FC<PluginComponentProps> = ({ data, appContext }) => {
  // Merge provided data with defaults
  const options: SimpleBorderData = {
    ...defaultData,
    ...(data as SimpleBorderData)
  };

  // Get current node information if available
  const nodeId = appContext?.selection?.nodeId;
  const nodeName = appContext?.currentNode?.label || 'Unknown Node';
  
  return (
    <div className="p-4">
      <div 
        style={{
          borderColor: options.borderColor,
          borderWidth: '2px',
          borderStyle: 'solid',
        }}
        className="w-full min-h-32 p-4 rounded-md bg-background"
      >
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Node: {nodeName}</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            ID: {nodeId || 'Not selected'}
          </span>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          This box has a border with color: <strong>{options.borderColor}</strong>
        </div>
      </div>
    </div>
  );
};

// Add options schema for the plugin editor
SimpleBorderPlugin.optionsSchema = {
  borderColor: {
    type: 'color',
    label: 'Border Color',
    default: defaultData.borderColor,
    description: 'Color of the border'
  }
};

export default SimpleBorderPlugin;