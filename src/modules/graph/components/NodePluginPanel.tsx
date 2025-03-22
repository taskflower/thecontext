import React, { useState } from 'react';
import { Puzzle, AlertCircle, Sliders } from 'lucide-react';
import { useAppStore } from '../../store';
import FullPluginWrapper from '@/modules/plugins/wrappers/FullPluginWrapper';
import PluginOptionsEditor from './PluginOptionsEditor';

const NodePluginPanel: React.FC = () => {
  const selectedNodeId = useAppStore(state => state.selected.node);
  const [isEditingOptions, setIsEditingOptions] = useState(false);
  
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
  
  // Get plugin data for display
  const pluginData = node.pluginData?.[node.pluginKey];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Puzzle className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-base font-medium">Node Plugin</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
            {node.pluginKey}
          </div>
          <button
            onClick={() => setIsEditingOptions(true)}
            className="flex items-center justify-center p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Edit Plugin Options"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Plugin Options Summary */}
      {pluginData && Object.keys(pluginData).length > 0 && (
        <div className="p-2 bg-muted/30 rounded-md border border-border">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-medium text-muted-foreground">Plugin Options</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(pluginData).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-medium">{key}:</span>{' '}
                <span className="text-muted-foreground">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Plugin Instance */}
      <FullPluginWrapper componentKey={node.pluginKey} nodeId={selectedNodeId} />
      
      {/* Plugin Options Editor Dialog */}
      {isEditingOptions && selectedNodeId && (
        <PluginOptionsEditor
          nodeId={selectedNodeId}
          onClose={() => setIsEditingOptions(false)}
        />
      )}
    </div>
  );
};

export default NodePluginPanel;