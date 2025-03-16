import React, { useState } from 'react';
import { useDialogState } from '@/hooks';
import { useAppStore } from '../store';
import { CardPanel, Dialog, ItemList } from '@/components/APPUI';
import { GraphNode } from '../types';
import { pluginRegistry } from '../plugin/plugin-registry';

export const NodesList: React.FC = () => {
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  const deleteNode = useAppStore(state => state.deleteNode);
  const addNode = useAppStore(state => state.addNode);
  const selectNode = useAppStore(state => state.selectNode);
  const updateNodePlugins = useAppStore(state => state.updateNodePlugins);
  const selected = useAppStore(state => state.selected);
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ 
    label: '', 
    assistant: '',
    plugins: [] 
  });
  
  const [showPluginDialog, setShowPluginDialog] = useState(false);
  const [selectedNodeForPlugins, setSelectedNodeForPlugins] = useState<string | null>(null);
  
  // Pobierz wszystkie dostępne wtyczki
  const availablePlugins = pluginRegistry.getAllPlugins();
  
  const handleAdd = () => {
    if (formData.label?.toString().trim()) {
      addNode({
        label: String(formData.label),
        assistant: String(formData.assistant || ''),
        plugins: Array.isArray(formData.plugins) ? formData.plugins : []
      });
      setIsOpen(false);
    }
  };
  
  const handlePluginSelection = (nodeId: string) => {
    setSelectedNodeForPlugins(nodeId);
    
    // Znajdź węzeł i ustaw jego aktualnie wybrane wtyczki
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setPluginSelections(node.plugins || []);
    } else {
      setPluginSelections([]);
    }
    
    setShowPluginDialog(true);
  };
  
  const [pluginSelections, setPluginSelections] = useState<string[]>([]);
  
  const handlePluginToggle = (pluginId: string) => {
    setPluginSelections(prev => {
      if (prev.includes(pluginId)) {
        return prev.filter(id => id !== pluginId);
      } else {
        return [...prev, pluginId];
      }
    });
  };
  
  const savePluginSelections = () => {
    if (selectedNodeForPlugins) {
      updateNodePlugins(selectedNodeForPlugins, pluginSelections);
      setShowPluginDialog(false);
    }
  };
  
  return (
    <>
      <CardPanel title="Nodes" onAddClick={() => openDialog({ label: '', assistant: '', plugins: [] })}>
        <ItemList<GraphNode> 
          items={nodes}
          selected={selected.node || ""}
          onClick={selectNode}
          onDelete={deleteNode}
          renderItem={(item) => (
            <div className="flex items-center p-2">
              <div className="font-medium">{item.label}</div>
              <div className="flex ml-auto items-center">
                {item.plugins && item.plugins.length > 0 && (
                  <span className="px-2 py-0.5 mr-2 text-xs bg-green-100 text-green-800 rounded-full">
                    {item.plugins.length} plugin(s)
                  </span>
                )}
                <button 
                  className="p-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePluginSelection(item.id);
                  }}
                >
                  Wtyczki
                </button>
                <span className="ml-2 inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 text-[10px] h-4">
                  {item.assistant}
                </span>
              </div>
            </div>
          )}
        />
      </CardPanel>
      
      {isOpen && (
        <Dialog 
          title="New Node"
          onClose={() => setIsOpen(false)}
          onAdd={handleAdd}
          fields={[
            { name: 'label', placeholder: 'Node name' },
            { name: 'assistant', placeholder: 'Assistant message' }
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
      
      {showPluginDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4">
            <h3 className="text-lg font-bold mb-4">Zarządzaj wtyczkami dla węzła</h3>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {availablePlugins.length > 0 ? (
                availablePlugins.map(plugin => (
                  <div key={plugin.config.id} className="flex items-center p-2 border-b">
                    <input
                      type="checkbox"
                      id={`plugin-${plugin.config.id}`}
                      checked={pluginSelections.includes(plugin.config.id)}
                      onChange={() => handlePluginToggle(plugin.config.id)}
                      className="mr-2"
                    />
                    <label htmlFor={`plugin-${plugin.config.id}`} className="flex-1">
                      <div className="font-medium">{plugin.config.name}</div>
                      <div className="text-xs text-gray-500">{plugin.config.description}</div>
                    </label>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Brak dostępnych wtyczek.
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPluginDialog(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Anuluj
              </button>
              <button
                onClick={savePluginSelections}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};