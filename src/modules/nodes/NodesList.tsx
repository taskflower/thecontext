import React from 'react';
import { useDialogState } from '@/hooks';
import { useAppStore } from '../store';
import { CardPanel, Dialog, ItemList } from '@/components/APPUI';
import { GraphNode } from '../types';

export const NodesList: React.FC = () => {
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  const deleteNode = useAppStore(state => state.deleteNode);
  const addNode = useAppStore(state => state.addNode);
  const selectNode = useAppStore(state => state.selectNode);
  const selected = useAppStore(state => state.selected);
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ label: '', assistant: '' });
  
  const handleAdd = () => {
    if (formData.label?.toString().trim()) {
      addNode({
        label: String(formData.label),
        assistant: String(formData.assistant || '')
      });
      setIsOpen(false);
    }
  };
  
  return (
    <>
      <CardPanel title="Nodes" onAddClick={() => openDialog({ label: '', assistant: '' })}>
        <ItemList<GraphNode> 
          items={nodes}
          selected={selected.node || ""}
          onClick={selectNode}
          onDelete={deleteNode}
          renderItem={(item) => (
            <div className="flex items-center p-2">
              <div className="font-medium">{item.label}</div>
              <span className="p-2 ml-auto inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 text-[10px] h-4">
                {item.assistant}
              </span>
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
    </>
  );
};