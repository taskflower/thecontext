import React from 'react';

import { useAppStore } from '../store';
import PluginPreviewWrapper from '../plugins/wrappers/PluginPreviewWrapper';
import { handlePluginLoadError } from './errorHandling';

/**
 * Component that displays the plugin associated with the currently selected node
 */
const NodePluginWrapper: React.FC = () => {
  const selectedNodeId = useAppStore(state => state.selected.node);
  
  try {
    // Get the selected node
    const node = useAppStore(state => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
      return scenario?.children.find(n => n.id === selectedNodeId);
    });
    
    if (!selectedNodeId || !node) {
      return (
        <div className="p-6 bg-muted/20 rounded-lg text-center text-muted-foreground">
          <p>Select a node to view its associated plugin</p>
        </div>
      );
    }
    
    if (!node.pluginKey) {
      return (
        <div className="p-6 bg-muted/20 rounded-lg text-center text-muted-foreground">
          <p>No plugin associated with this node</p>
        </div>
      );
    }
    
    return <PluginPreviewWrapper componentKey={node.pluginKey} />;
  } catch (error) {
    // Handle error when loading plugin
    handlePluginLoadError(selectedNodeId || 'unknown', error);
    
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h3 className="text-md font-medium text-red-800">Failed to load plugin</h3>
        <p className="mt-2 text-sm text-red-700">
          There was an error loading the plugin for this node
        </p>
      </div>
    );
  }
};

export default NodePluginWrapper;