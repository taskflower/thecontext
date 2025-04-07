// components/nodes/NodeItem.tsx
import React from 'react';
import useStore from '../../store';
// Użyj import type, aby uniknąć konfliktu z DOM Node
import type { Node as FlowNode } from '../../store/types';

interface NodeItemProps {
  node: FlowNode;  // Zmieniona nazwa, aby uniknąć konfliktu
  index: number;
}

const NodeItem: React.FC<NodeItemProps> = ({ node, index }) => {
  const flowState = useStore(state => state.flowState);
  const view = useStore(state => state.view);
  const selectedIds = useStore(state => state.selectedIds);
  const editNode = useStore(state => state.editNode);
  const deleteNode = useStore(state => state.deleteNode);
  
  const handleSelect = () => {
    editNode(node.id);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Usunąć ten węzeł?')) {
      deleteNode(node.id);
    }
  };
  
  const isActive = flowState.currentIndex === index && view === 'flow';
  const isSelected = node.id === selectedIds.node;
  
  return (
    <div 
      className={`flex justify-between items-center p-2 rounded shadow cursor-pointer hover:bg-gray-50 ${
        isActive
          ? 'bg-blue-100 border-l-4 border-blue-500' 
          : isSelected 
            ? 'bg-green-100 border-l-4 border-green-500' 
            : 'bg-white'
      }`}
      onClick={handleSelect}
    >
      <div>
        <div>{node.label || `Node ${index + 1}`}</div>
        {node.description && <div className="text-xs text-gray-500">{node.description}</div>}
      </div>
      <button 
        onClick={handleDelete}
        className="text-red-500"
      >×</button>
    </div>
  );
};

export default NodeItem;