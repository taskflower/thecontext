// src/components/nodes/CustomNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useNodeStore } from '../../stores/nodeStore';

const nodeColors: Record<string, string> = {
  input: '#9dd29d',
  process: '#8ab4f8',
  output: '#f8baba',
  plugin: '#f8de7e',
  default: '#d3d3d3'
};

// Define the extended props for CustomNode
interface CustomNodeProps extends NodeProps {
  onEditNode?: (nodeId: string) => void;
}

const CustomNode: React.FC<NodeProps> = (props) => {
  const { data, isConnectable, id } = props;
  const onEditNode = props.data?.onEditNode;
  const nodeType = data.type || 'default';
  const backgroundColor = nodeColors[nodeType] || nodeColors.default;
  const { setActiveNodeId } = useNodeStore();
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveNodeId(id);
    if (onEditNode) {
      onEditNode(id);
    }
  };
  
  return (
    <div className="relative p-0.5">
      <div 
        className="rounded-md shadow-md border border-gray-300 w-64 max-w-md overflow-hidden"
        style={{ backgroundColor }}
      >
        <div className="py-2 px-3 font-semibold text-gray-800 border-b border-gray-300 bg-opacity-90 flex justify-between items-center">
          <div>{data.label || 'Node'}</div>
          <div className="flex items-center">
            {data.pluginId && (
              <div className="text-xs px-2 py-0.5 bg-gray-700 text-white rounded-full mr-2">
                Plugin
              </div>
            )}
            <button 
              onClick={handleEditClick}
              className="p-1 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded"
              title="Edit node"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-3 bg-white">
          {/* Content preview - truncated */}
          <div className="text-xs font-mono bg-gray-50 rounded p-2 max-h-24 overflow-hidden text-gray-700">
            {data.content ? (
              data.content.length > 150 
                ? data.content.substring(0, 150) + '...' 
                : data.content
            ) : (
              <em className="text-gray-400">No content</em>
            )}
          </div>
          
          {/* Response preview if available */}
          {data.response && (
            <div className="mt-2">
              <div className="text-xs font-semibold text-gray-500 mb-1">Response:</div>
              <div className="text-xs bg-blue-50 border-l-2 border-blue-300 p-2 max-h-20 overflow-hidden">
                {data.response.length > 100 
                  ? data.response.substring(0, 100) + '...' 
                  : data.response}
              </div>
            </div>
          )}
        </div>
        
        {/* Execution status indicator */}
        {data.status && (
          <div className={`text-xs py-1 px-2 text-center ${
            data.status === 'completed' ? 'bg-green-100 text-green-800' :
            data.status === 'error' ? 'bg-red-100 text-red-800' :
            data.status === 'running' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {data.status}
          </div>
        )}
      </div>
      
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        isConnectable={isConnectable}
        className="w-3 h-3 border-2"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        isConnectable={isConnectable}
        className="w-3 h-3 border-2"
      />
    </div>
  );
};

export default memo(CustomNode);