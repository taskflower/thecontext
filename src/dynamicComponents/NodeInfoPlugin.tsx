// src/dynamicComponents/NodeInfoPlugin.tsx

import React, { useState } from 'react';
import { PluginComponentProps } from '../modules/plugins/types';

// Typ danych pluginu przechowywanych w węźle
interface NodeInfoPluginData {
  notes?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  lastEdited?: string;
}

const NodeInfoPlugin: React.FC<PluginComponentProps<NodeInfoPluginData>> = ({ 
  data, 
  appContext 
}) => {
  // Inicjalizacja stanu z danymi z pluginu lub wartości domyślne
  const [notes, setNotes] = useState(data?.notes || '');
  const [priority, setPriority] = useState(data?.priority || 'medium');
  const [tags, setTags] = useState(data?.tags?.join(', ') || '');

  // Hook do aktualizacji danych węzła po zmianach
  const handleSave = () => {
    // Znajdź odpowiedni element DOM za pomocą event.target
    const updateNodePluginData = window.__DYNAMIC_COMPONENTS__.registry.updateNodePluginData;
    if (!updateNodePluginData || !appContext.currentNode) return;

    // Stworzyć obiekt z aktualnymi danymi
    const updatedData: NodeInfoPluginData = {
      notes,
      priority: priority as 'low' | 'medium' | 'high',
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      lastEdited: new Date().toISOString()
    };

    // Użyj store do aktualizacji danych węzła
    updateNodePluginData(appContext.currentNode.id, 'NodeInfoPlugin', updatedData);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Node Information</h3>
        {appContext.currentNode && (
          <div className="text-sm text-muted-foreground mb-4">
            Node: {appContext.currentNode.label}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setTimeout(handleSave, 0);
            }}
            className="w-full px-3 py-2 bg-background border border-border rounded-md"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            onBlur={handleSave}
            placeholder="Enter tags..."
            className="w-full px-3 py-2 bg-background border border-border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            placeholder="Add notes about this node..."
            className="w-full px-3 py-2 min-h-[100px] bg-background border border-border rounded-md"
          />
        </div>
      </div>

      {data?.lastEdited && (
        <div className="text-xs text-muted-foreground">
          Last edited: {new Date(data.lastEdited).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default NodeInfoPlugin;