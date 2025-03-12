/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/nodes/NodeEditor.tsx
import React, { useState, useEffect } from 'react';
import { useNodeStore } from '../../stores/nodeStore';
import { usePluginStore } from '../../stores/pluginStore';

interface NodeEditorProps {
  onClose?: () => void;
}

interface PluginOption {
  id: string;
  name: string;
  description: string;
}

// First, let's create a type to ensure activeNodeId exists in the store
type NodeStoreWithActive = {
  activeNodeId: string | null;
  getNode: (id: string) => any | null;
  updateNodeData: (id: string, data: any) => void;
  assignPluginToNode: (nodeId: string, pluginId: string) => void;
  removePluginFromNode: (nodeId: string) => void;
};

const NodeEditor: React.FC<NodeEditorProps> = ({ onClose }) => {
  // Properly typed store selector
  const { activeNodeId, getNode, updateNodeData, assignPluginToNode, removePluginFromNode } = 
    useNodeStore(state => state as unknown as NodeStoreWithActive);
  
  const { getAllPlugins } = usePluginStore();
  
  const [node, setNode] = useState(activeNodeId ? getNode(activeNodeId) : null);
  const [content, setContent] = useState(node?.data.content || '');
  const [label, setLabel] = useState(node?.data.label || '');
  const [activeTab, setActiveTab] = useState('content');
  const [selectedPluginId, setSelectedPluginId] = useState(node?.data.pluginId || '');
  
  const plugins = getAllPlugins();
  const pluginOptions: PluginOption[] = plugins.map(plugin => ({
    id: plugin.id,
    name: plugin.name,
    description: plugin.description
  }));

  // Update local state when active node changes
  useEffect(() => {
    if (activeNodeId) {
      const currentNode = getNode(activeNodeId);
      if (currentNode) {
        setNode(currentNode);
        setContent(currentNode.data.content || '');
        setLabel(currentNode.data.label || '');
        setSelectedPluginId(currentNode.data.pluginId || '');
      }
    }
  }, [activeNodeId, getNode]);

  // Save changes to the node
  const handleSave = () => {
    if (!activeNodeId || !node) return;
    
    updateNodeData(activeNodeId, {
      content,
      label
    });
    
    // Update plugin association
    if (selectedPluginId) {
      if (selectedPluginId !== node.data.pluginId) {
        assignPluginToNode(activeNodeId, selectedPluginId);
      }
    } else if (node.data.pluginId) {
      removePluginFromNode(activeNodeId);
    }
    
    // Refresh node data
    setNode(getNode(activeNodeId));
    
    if (onClose) {
      onClose();
    }
  };

  if (!node || !activeNodeId) {
    return <div className="p-4 text-red-500">No node selected</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-2xl">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h2 className="text-lg font-medium text-gray-800">Edit Node</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Node Name
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-2 px-4 ${activeTab === 'content' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('content')}
            >
              Content
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'plugin' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('plugin')}
            >
              Plugin
            </button>
            <button
              className={`py-2 px-4 ${activeTab === 'variables' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('variables')}
            >
              Variables
            </button>
          </div>
          
          {activeTab === 'content' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content/Prompt
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter node content or prompt here..."
              />
              <p className="mt-1 text-xs text-gray-500">
                You can use variables like [[nodeId.response]] to reference output from other nodes.
              </p>
            </div>
          )}
          
          {activeTab === 'plugin' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plugin
              </label>
              <select
                value={selectedPluginId}
                onChange={(e) => setSelectedPluginId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">None</option>
                {pluginOptions.map(plugin => (
                  <option key={plugin.id} value={plugin.id}>
                    {plugin.name}
                  </option>
                ))}
              </select>
              
              {selectedPluginId && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">Plugin Configuration</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {pluginOptions.find(p => p.id === selectedPluginId)?.description || 'No description available'}
                  </p>
                  
                  {node.data.pluginConfig && (
                    <div className="mt-2">
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(node.data.pluginConfig, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'variables' && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variables
              </label>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm">
                  Variables allow you to reference this node's output in other nodes.
                </p>
                <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-xs">
                  [[${node.id}.response]]
                </div>
              </div>
              
              {node.data.variables && Object.keys(node.data.variables).length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium">Current Variables</h4>
                  <ul className="mt-1 space-y-1">
                    {Object.entries(node.data.variables).map(([key, value]:any) => (
                      <li key={key} className="flex justify-between text-xs bg-blue-50 p-2 rounded">
                        <span className="font-medium">{key}:</span>
                        <span className="font-mono">{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-between">
          {/* Delete button on the left */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this node?')) {
                const nodeStore = useNodeStore.getState();
                if (activeNodeId) {
                  nodeStore.deleteNode(activeNodeId);
                }
                if (onClose) {
                  onClose();
                }
              }
            }}
            className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700"
          >
            Delete Node
          </button>
          
          {/* Cancel and Save buttons on the right */}
          <div className="flex space-x-3">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeEditor;