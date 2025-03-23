// src/modules/plugins/wrappers/StepPluginWrapper.tsx
import React from 'react';
import PluginPreviewWrapper from './PluginPreviewWrapper';
import { AppContextData, NodeData } from '../types';

interface StepPluginWrapperProps {
  componentKey: string;
  nodeData?: NodeData;
  workspaceId?: string;
  scenarioId?: string;
}

/**
 * A specialized wrapper for displaying plugins in the step modal
 * that provides node context to the plugin
 */
const StepPluginWrapper: React.FC<StepPluginWrapperProps> = ({
  componentKey,
  nodeData,
  workspaceId = '',
  scenarioId = '',
}) => {
  // If no node data, provide empty values
  const node = nodeData || {
    id: '',
    name: 'Unknown Node',
  };
  
  // Create context with current node data
  const context: Partial<AppContextData> = {
    currentNode: node,
    selection: {
      workspaceId,
      scenarioId,
      nodeId: node.id,
    },
  };
  
  // Pass the node's plugin data if available
  const customData = node.pluginData?.[componentKey];
  
  return (
    <div className="border border-border rounded-md overflow-hidden">
      <PluginPreviewWrapper
        componentKey={componentKey}
        customData={customData}
        context={context}
        className="border-0"
      />
    </div>
  );
};

export default StepPluginWrapper;