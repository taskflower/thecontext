import React from 'react';
import DynamicComponentWrapper from '../plugins/PluginWrapper';
import { useAppStore } from '../store';

/**
 * Component that displays the plugin associated with the currently selected node
 */
const NodePluginWrapper: React.FC = () => {
  const selectedNodeId = useAppStore(state => state.selected.node);
  
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
  
  return <DynamicComponentWrapper componentKey={node.pluginKey} />;
};

export default NodePluginWrapper;