// src/components/nodes/NodeContextMenu.tsx
import React from 'react';
import { useNodeStore } from '../../stores/nodeStore';
import { useScenarioStore } from '../../stores/scenarioStore';

interface NodeContextMenuProps {
  x: number;
  y: number;
  nodeId: string;
  onClose: () => void;
  onEdit?: (nodeId: string) => void;
}

const NodeContextMenu: React.FC<NodeContextMenuProps> = ({ x, y, nodeId, onClose, onEdit }) => {
  const { getNode, deleteNode, duplicateNode } = useNodeStore();
  const { updateScenario } = useScenarioStore();
  const node = getNode(nodeId);

  if (!node) return null;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      deleteNode(nodeId);
    }
    onClose();
  };

  const handleDuplicate = () => {
    const newNodeId = duplicateNode(nodeId);
    // Position the new node slightly offset from the original
    if (newNodeId) {
      const newNode = getNode(newNodeId);
      if (newNode) {
        updateScenario(newNode.scenarioId, {
          updatedAt: Date.now()
        });
      }
    }
    onClose();
  };

  return (
    <div 
      className="absolute z-10 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-40"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-2 border-b border-gray-100 font-medium text-sm text-gray-500">
        {node.data.label || 'Node Options'}
      </div>
      <ul>
        <li>
          <button 
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
            onClick={() => {
              if (onEdit) {
                onEdit(nodeId);
                onClose();
              }
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
        </li>
        <li>
          <button 
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
            onClick={handleDuplicate}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Duplicate
          </button>
        </li>
        <li>
          <button 
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
            onClick={() => {
              navigator.clipboard.writeText(nodeId);
              onClose();
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy ID
          </button>
        </li>
        <li>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            onClick={handleDelete}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </li>
      </ul>
    </div>
  );
};

export default NodeContextMenu;