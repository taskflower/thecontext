// src/modules/graph/components/NodePluginPanel.tsx

import React from 'react';
import { Puzzle, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store';
import FullPluginWrapper from '@/modules/plugins/wrappers/FullPluginWrapper';


const NodePluginPanel: React.FC = () => {
  const selectedNodeId = useAppStore(state => state.selected.node);
  
  // Get the selected node
  const node = useAppStore(state => {
    const workspace = state.items.find(w => w.id === state.selected.workspace);
    const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
    return scenario?.children.find(n => n.id === selectedNodeId);
  });
  
  if (!selectedNodeId || !node) {
    return (
      <div className="p-6 border border-border rounded-lg bg-muted/10 text-center">
        <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <h3 className="text-base font-medium mb-1">No Node Selected</h3>
        <p className="text-sm text-muted-foreground">
          Select a node to view its associated plugin
        </p>
      </div>
    );
  }
  
  if (!node.pluginKey) {
    return (
      <div className="p-6 border border-border rounded-lg bg-muted/10 text-center">
        <Puzzle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
        <h3 className="text-base font-medium mb-1">No Plugin Configured</h3>
        <p className="text-sm text-muted-foreground">
          This node doesn't have a plugin associated with it
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Configure a plugin using the node's menu options
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Puzzle className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-base font-medium">Node Plugin</h3>
        </div>
        <div className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
          {node.pluginKey}
        </div>
      </div>
      
      {/* Przekazujemy ID węzła, aby wrapper wiedział, że ma pobierać dane z węzła */}
      <FullPluginWrapper componentKey={node.pluginKey} nodeId={selectedNodeId} />
    </div>
  );
};

export default NodePluginPanel;