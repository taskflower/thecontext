// src/modules/plugins/wrappers/StepPluginWrapper.tsx
import React from 'react';
import PluginPreviewWrapper from './PluginPreviewWrapper';
import { useAppStore } from '../../store';
import { AppContextData, NodeData } from '../types';

interface StepPluginWrapperProps {
  componentKey: string;
  nodeData?: NodeData;
  workspaceId?: string;
  scenarioId?: string;
}

const StepPluginWrapper: React.FC<StepPluginWrapperProps> = ({
  componentKey,
  nodeData,
  workspaceId = '',
  scenarioId = '',
}) => {
  // Get the flow session state
  const isFlowPlaying = useAppStore(state => state.flowSession?.isPlaying || false);
  
  // Get the appropriate update functions based on session state
  const updateNodeUserPrompt = useAppStore(state => 
    isFlowPlaying ? state.updateTempNodeUserPrompt : state.updateNodeUserPrompt
  );
  
  const updateNodeAssistantMessage = useAppStore(state => 
    isFlowPlaying ? state.updateTempNodeAssistantMessage : state.updateNodeAssistantMessage
  );
  
  // Node data
  const node = nodeData || {
    id: '',
    name: 'Unknown Node',
  };
  
  const context: Partial<AppContextData> = {
    currentNode: node,
    selection: {
      workspaceId,
      scenarioId,
      nodeId: node.id,
    },
    // Use the appropriate update functions
    updateNodeUserPrompt,
    updateNodeAssistantMessage
  };
  
  const customData = node.pluginData?.[componentKey];
  
  return (
    
      <PluginPreviewWrapper
        componentKey={componentKey}
        customData={customData}
        context={context}
        className="border-0"
      />
   
  );
};

export default StepPluginWrapper;