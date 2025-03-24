import React, { useState, useEffect } from 'react';
import { X, Save, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store';
import { cn } from '@/utils/utils';

interface NodeEditorDialogProps {
  nodeId: string;
  onClose: () => void;
}

const NodeEditorDialog: React.FC<NodeEditorDialogProps> = ({ nodeId, onClose }) => {
  const [nodeData, setNodeData] = useState({
    label: '',
    assistantMessage: '',
    userPrompt: ''
  });
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  
  // Direct access to state to avoid selector issues
  const state = useAppStore.getState();
  const workspace = state.items.find(w => w.id === state.selected.workspace);
  const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
  const node = scenario?.children.find(n => n.id === nodeId);
  
  useEffect(() => {
    if (node) {
      setNodeData({
        label: node.label || '',
        assistantMessage: node.assistantMessage || '',
        userPrompt: node.userPrompt || ''
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [node]);
  
  if (!node) {
    return null;
  }
  
  // Save changes
  const handleSave = () => {
    const store = useAppStore.getState();
    
    // The actions for updating node label, assistantMessage, and userPrompt would need to be implemented in the store
    // Updating label - we need to add this function to nodeActions.ts
    if (node.label !== nodeData.label) {
      // Assuming there's an updateNodeLabel function in the store
      store.updateNodeLabel(nodeId, nodeData.label);
    }
    
    // Updating assistant message
    if (node.assistantMessage !== nodeData.assistantMessage) {
      // Assuming there's an updateNodeAssistantMessage function in the store
      store.updateNodeAssistantMessage(nodeId, nodeData.assistantMessage);
    }
    
    // Updating user prompt
    if (node.userPrompt !== nodeData.userPrompt) {
      // Assuming there's an updateNodeUserPrompt function in the store
      store.updateNodeUserPrompt(nodeId, nodeData.userPrompt);
    }
    
    setIsDirty(false);
    onClose();
  };
  
  // Reset changes
  const handleReset = () => {
    if (node) {
      setNodeData({
        label: node.label || '',
        assistantMessage: node.assistantMessage || '',
        userPrompt: node.userPrompt || ''
      });
      setIsDirty(false);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNodeData(prev => {
      const newData = { ...prev, [name]: value };
      setIsDirty(true);
      return newData;
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4 max-h-[80vh] flex flex-col" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Edit Node</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">
            <p>Loading node data...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label htmlFor="label" className="block text-sm font-medium mb-1">
                  Label
                </label>
                <input
                  type="text"
                  id="label"
                  name="label"
                  value={nodeData.label}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              
              <div>
                <label htmlFor="userPrompt" className="block text-sm font-medium mb-1">
                  User Prompt
                </label>
                <textarea
                  id="userPrompt"
                  name="userPrompt"
                  value={nodeData.userPrompt}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              
              <div>
                <label htmlFor="assistantMessage" className="block text-sm font-medium mb-1">
                  Assistant Message
                </label>
                <textarea
                  id="assistantMessage"
                  name="assistantMessage"
                  value={nodeData.assistantMessage}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-border">
          <button
            onClick={handleReset}
            disabled={!isDirty}
            className={cn(
              "px-3 py-1.5 text-sm border border-border rounded-md flex items-center",
              isDirty ? "hover:bg-muted" : "opacity-50 cursor-not-allowed"
            )}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={cn(
              "px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md flex items-center",
              isDirty ? "hover:bg-primary/90" : "opacity-50 cursor-not-allowed"
            )}
          >
            <Save className="h-4 w-4 mr-1.5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeEditorDialog;