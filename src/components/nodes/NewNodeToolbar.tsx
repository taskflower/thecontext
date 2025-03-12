// src/components/nodes/NewNodeToolbar.tsx
import React, { useState } from 'react';
import { useReactFlow } from 'reactflow';
import { useNodeStore } from '../../stores/nodeStore';
import { useScenarioStore } from '../../stores/scenarioStore';

interface NodeType {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  defaultData?: Record<string, any>;
}

interface NewNodeToolbarProps {
  scenarioId: string;
}

const NewNodeToolbar: React.FC<NewNodeToolbarProps> = ({ scenarioId }) => {
  const [expanded, setExpanded] = useState(false);
  const { createNode, getNode } = useNodeStore();
  const { addNodeToScenario } = useScenarioStore();
  const reactFlowInstance = useReactFlow();

  const nodeTypes: NodeType[] = [
    {
      type: 'input',
      label: 'Input',
      color: '#9dd29d',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      defaultData: {
        label: 'Input',
        type: 'input',
        content: ''
      }
    },
    {
      type: 'process',
      label: 'Process',
      color: '#8ab4f8',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      defaultData: {
        label: 'Process',
        type: 'process',
        content: ''
      }
    },
    {
      type: 'output',
      label: 'Output',
      color: '#f8baba',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
        </svg>
      ),
      defaultData: {
        label: 'Output',
        type: 'output',
        content: ''
      }
    },
    {
      type: 'plugin',
      label: 'Plugin',
      color: '#f8de7e',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      ),
      defaultData: {
        label: 'Plugin',
        type: 'plugin',
        content: '',
        pluginId: null
      }
    }
  ];

  const handleAddNode = (nodeType: NodeType) => {
    if (!scenarioId) {
      console.error("No scenario ID provided");
      return;
    }

    try {
      console.log(`Adding ${nodeType.type} node to scenario ${scenarioId}`);
      
      // Get the current viewport
      const { x, y, zoom } = reactFlowInstance.getViewport();
      console.log("Current viewport:", { x, y, zoom });
      
      // Get center position for the new node
      const center = reactFlowInstance.project({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
      
      // Add random offset
      const position = {
        x: center.x + Math.random() * 100 - 50,
        y: center.y + Math.random() * 100 - 50
      };
      
      console.log("Node position:", position);
      
      // Create the node in the nodeStore
      const nodeId = createNode(
        nodeType.type,
        position,
        nodeType.defaultData,
        scenarioId
      );
      
      console.log(`Node created with ID: ${nodeId}`);
      
      // Make sure it's added to the scenario
      addNodeToScenario(scenarioId, nodeId);
      
      // IMPORTANT FIX: Add node to reactFlow directly
      const node = getNode(nodeId);
      if (node) {
        // Add the node to ReactFlow's state
        reactFlowInstance.setNodes((nodes) => [
          ...nodes,
          {
            id: node.id,
            type: 'custom',
            position: node.position,
            data: {
              ...node.data,
              label: node.data.label || node.type,
              response: node.data.response || ''
            },
          }
        ]);
      }
      
      // Close the toolbar
      setExpanded(false);
      
    } catch (error) {
      console.error("Error adding node:", error);
    }
  };

  return (
    <div className="bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">
      {expanded ? (
        <div>
          <div className="p-2 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-medium">Add Node</h3>
            <button 
              onClick={() => setExpanded(false)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-2">
            {nodeTypes.map(nodeType => (
              <button
                key={nodeType.type}
                className="w-full mb-1 last:mb-0 flex items-center px-3 py-2 rounded hover:bg-gray-100 text-left"
                onClick={() => handleAddNode(nodeType)}
                style={{ borderLeft: `3px solid ${nodeType.color}` }}
              >
                <span className="mr-2 text-gray-600">{nodeType.icon}</span>
                <span className="text-sm">{nodeType.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Node</span>
        </button>
      )}
    </div>
  );
};

export default NewNodeToolbar;