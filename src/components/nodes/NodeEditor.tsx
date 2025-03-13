// src/components/nodes/NodeEditor.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useNodeStore } from "../../stores/nodeStore";
import { usePluginStore } from "../../stores/pluginStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { useScenarioStore } from "../../stores/scenarioStore";

interface NodeEditorProps {
  onClose: () => void;
  scenarioId: string;
}

const NodeEditor: React.FC<NodeEditorProps> = ({ onClose, scenarioId }) => {
  const {
    activeNodeId,
    getNode,
    updateOrAddNode,
    assignPluginToNode,
    removePluginFromNode,
    setActiveNodeId,
  } = useNodeStore((state) => state);
  const { getAllPlugins } = usePluginStore();
  const { getWorkspaceContext } = useWorkspaceStore();

  // Zmemoizowany defaultNode – zależny tylko od scenarioId
  const defaultNode = useMemo(
    () => ({
      id: null,
      type: "default",
      position: { x: 100, y: 100 },
      data: { prompt: "", label: "", isStartNode: false },
      scenarioId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    [scenarioId]
  );

  const initialNode: any = activeNodeId ? getNode(activeNodeId) : defaultNode;

  const [node, setNode] = useState(initialNode);
  const [prompt, setPrompt] = useState(initialNode.data.prompt || "");
  const [label, setLabel] = useState(initialNode.data.label || "");
  const [isStartNode, setIsStartNode] = useState(
    initialNode.data.isStartNode || false
  );
  const [activeTab, setActiveTab] = useState("content");
  const [selectedPluginId, setSelectedPluginId] = useState(
    initialNode.data.pluginId || ""
  );
  const [selectedContextKey, setSelectedContextKey] = useState(
    initialNode.data.contextKey || ""
  );

  const plugins = getAllPlugins();
  const pluginOptions = plugins.map((plugin) => ({
    id: plugin.id,
    name: plugin.name,
    description: plugin.description,
  }));

  // Get workspace context for the current workspace
  // Get the proper workspaceId from the scenarioId
  const scenarioStore = useScenarioStore.getState();
  const scenario = scenarioStore.getScenario(scenarioId);
  const workspaceId =
    scenario?.workspaceId || node.workspaceId || scenarioId.split("-")[0];

  console.log("NodeEditor - WorkspaceId:", workspaceId);
  const workspaceContext = getWorkspaceContext(workspaceId) || {};
  console.log("NodeEditor - Available context:", workspaceContext);
  const contextKeys = Object.keys(workspaceContext);

  // Uaktualniamy stan tylko przy zmianie activeNodeId lub scenarioId (nie defaultNode, bo jest memoizowany)
  useEffect(() => {
    if (activeNodeId) {
      const currentNode = getNode(activeNodeId);
      if (currentNode) {
        setNode(currentNode);
        setPrompt(currentNode.data.prompt || "");
        setLabel(currentNode.data.label || "");
        setIsStartNode(currentNode.data.isStartNode || false);
        setSelectedPluginId(currentNode.data.pluginId || "");
        setSelectedContextKey(currentNode.data.contextKey || "");
      }
    } else {
      // Brak aktywnego węzła – ustawiamy wartości domyślne
      setNode(defaultNode);
      setPrompt("");
      setLabel("");
      setIsStartNode(false);
      setSelectedPluginId("");
      setSelectedContextKey("");
    }
  }, [activeNodeId, getNode, scenarioId]);

  const handleSave = () => {
    const newNodeId = updateOrAddNode(
      activeNodeId,
      node.type,
      node.position,
      {
        prompt,
        label,
        isStartNode,
        contextKey: selectedContextKey,
      },
      node.scenarioId
    );

    setActiveNodeId(newNodeId);

    if (selectedPluginId) {
      if (selectedPluginId !== node.data.pluginId) {
        assignPluginToNode(newNodeId, selectedPluginId);
      }
    } else if (node.data.pluginId) {
      removePluginFromNode(newNodeId);
    }

    setNode(getNode(newNodeId));

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-2xl">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h2 className="text-lg font-medium text-gray-800">
          {activeNodeId ? "Edit Node" : "Add Node"}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
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
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isStartNode"
              checked={isStartNode}
              onChange={(e) => setIsStartNode(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isStartNode"
              className="ml-2 block text-sm text-gray-900"
            >
              Set as start node
            </label>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            The start node will be executed first in the scenario. Only one node
            can be marked as start node.
          </p>
        </div>

        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              className={`py-2 px-4 ${
                activeTab === "content"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("content")}
            >
              Content
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === "plugin"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("plugin")}
            >
              Plugin
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === "context"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("context")}
            >
              Context
            </button>
          </div>

          {activeTab === "content" && (
            <div className="mt-3 min-h-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt/Content
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter node content or prompt here..."
              />
            </div>
          )}

          {activeTab === "plugin" && (
            <div className="mt-3 min-h-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plugin
              </label>
              <select
                value={selectedPluginId}
                onChange={(e) => setSelectedPluginId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">None</option>
                {pluginOptions.map((plugin) => (
                  <option key={plugin.id} value={plugin.id}>
                    {plugin.name}
                  </option>
                ))}
              </select>

              {selectedPluginId && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <h4 className="font-medium text-sm">Plugin Configuration</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {pluginOptions.find((p) => p.id === selectedPluginId)
                      ?.description || "No description available"}
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

          {activeTab === "context" && (
            <div className="mt-3 min-h-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Container Context Key
              </label>
              <div className="mb-2">
                <p className="text-xs text-gray-500">
                  Select a context key to update from this node. The node's
                  message output will be stored in this key after execution.
                </p>
              </div>

              {contextKeys.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={selectedContextKey}
                    onChange={(e) => setSelectedContextKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">None</option>
                    {contextKeys.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>

                  {selectedContextKey && (
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg
                            className="h-5 w-5 text-blue-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            Selected Context Key:{" "}
                            <span className="font-bold">
                              {selectedContextKey}
                            </span>
                          </h3>
                          <p className="mt-1 text-xs text-blue-700">
                            After this node executes, its final message will be
                            stored in this workspace context key.
                          </p>
                          {workspaceContext[selectedContextKey] !==
                            undefined && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-blue-800">
                                Current value:
                              </p>
                              <div className="mt-1 p-2 bg-white rounded text-xs text-gray-800 max-h-20 overflow-auto">
                                {typeof workspaceContext[selectedContextKey] ===
                                "object"
                                  ? JSON.stringify(
                                      workspaceContext[selectedContextKey],
                                      null,
                                      2
                                    )
                                  : String(
                                      workspaceContext[selectedContextKey]
                                    )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-md text-center">
                  <p className="text-amber-800 text-sm">
                    No context keys available in the workspace.
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Please add context keys to the workspace first.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          {activeNodeId && (
            <button
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to delete this node?")
                ) {
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
          )}

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
