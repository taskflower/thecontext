import React from 'react';
import { useAppStore } from '../store';
import useDynamicComponentStore from '../plugins/pluginsStore';

/**
 * Component for selecting which plugin is associated with a node
 * This should be displayed in your node details panel
 */
const NodePluginSelector: React.FC = () => {
  const selectedNodeId = useAppStore(state => state.selected.node);
  const setNodePlugin = useAppStore(state => state.setNodePlugin);
  
  // Get the selected node
  const node = useAppStore(state => {
    const workspace = state.items.find(w => w.id === state.selected.workspace);
    const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
    return scenario?.children.find(n => n.id === selectedNodeId);
  });
  
  // Get all available plugin keys
  const pluginKeys = useDynamicComponentStore(state => state.getComponentKeys());
  
  if (!node) {
    return (
      <div className="p-4 bg-muted/20 rounded-lg text-center text-muted-foreground">
        <p>Select a node to associate a plugin</p>
      </div>
    );
  }
  
  const handlePluginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNodePlugin(selectedNodeId, value === '' ? null : value);
  };
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" htmlFor="node-plugin">
        Associated Plugin
      </label>
      <select 
        id="node-plugin"
        className="w-full p-2 bg-background border border-border rounded"
        value={node.pluginKey || ''}
        onChange={handlePluginChange}
      >
        <option value="">No Plugin</option>
        {pluginKeys.map(key => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NodePluginSelector;