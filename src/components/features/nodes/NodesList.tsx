// components/features/nodes/NodesList.tsx
import React from 'react';
import { useAppStore } from '../../../store';
import { useDialogState } from '@/hooks';
import { CardPanel, Dialog, ItemList } from '@/components/APPUI';
import { Node } from '@/types/app';

export const NodesList: React.FC = () => {
  // Używamy bezpośrednio stanu zamiast selektorów funkcyjnych
  const nodes = useAppStore(state => state.currentNodes);
  const deleteNode = useAppStore(state => state.deleteNode);
  const addNode = useAppStore(state => state.addNode);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState({ label: '', value: '' });
  
  const handleAdd = () => {
    if (formData.label?.toString().trim() && formData.value?.toString().trim()) {
      addNode({
        label: String(formData.label),
        value: Number(formData.value)
      });
      setIsOpen(false);
    }
  };
  
  return (
    <>
      <CardPanel title="Nodes" onAddClick={() => openDialog({ label: '', value: '' })}>
        <ItemList<Node> 
          items={nodes}
          selected=""
          onClick={() => {}}
          onDelete={deleteNode}
          renderItem={(item) => (
            <div className="flex items-center">
              <div className="font-medium">{item.label}</div>
              <span className="ml-auto inline-flex items-center px-1 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 text-[10px] h-4">
                {item.value}
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
            { name: 'value', placeholder: 'Value', type: 'number' }
          ]}
          formData={formData}
          onChange={handleChange}
        />
      )}
    </>
  );
};