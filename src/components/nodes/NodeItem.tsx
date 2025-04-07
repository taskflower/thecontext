// components/nodes/NodeItem.tsx
import React from 'react';
import useStore from '../../store';
// Użyj import type, aby uniknąć konfliktu z DOM Node
import type { Node as FlowNode } from '../../store/types';

interface NodeItemProps {
  node: FlowNode;
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
      className={`flex items-center py-2 px-3 rounded-md text-sm cursor-pointer hover:bg-[hsl(var(--accent))] transition-colors ${
        isActive
          ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border-l-2 border-[hsl(var(--primary))]'
          : isSelected
            ? 'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] border-l-2 border-green-500'
            : ''
      }`}
      onClick={handleSelect}
    >
      <div className="flex-1">
        <div className="font-medium">{node.label || `Node ${index + 1}`}</div>
        {node.description && <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{node.description}</div>}
      </div>
      <button 
        onClick={handleDelete}
        className="text-[hsl(var(--destructive))] hover:opacity-80"
        aria-label="Usuń węzeł"
      >&times;</button>
    </div>
  );
};

export default NodeItem;