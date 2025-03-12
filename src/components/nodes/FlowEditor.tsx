// src/components/nodes/FlowEditor.tsx
import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  ConnectionLineType,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useScenarioStore } from '../../stores/scenarioStore';
import { useNodeStore } from '../../stores/nodeStore';
import { useExecutionStore } from '../../stores/executionStore';
import CustomNode from './CustomNode';

import NewNodeToolbar from './NewNodeToolbar';
import NodeEditor from './NodeEditor';

const FlowEditor: React.FC<{ onEditNode?: (nodeId: string) => void }> = ({ onEditNode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [showNodeEditor, setShowNodeEditor] = useState(false);

  // Get scenario data from store
  const { getScenario, createEdge, addEdgeToScenario, edges: storeEdges, getCurrentScenario } = useScenarioStore();
  const { getNode, updateNode, setActiveNodeId } = useNodeStore();
  const { executeScenario, getLatestExecution } = useExecutionStore();

  // Get current scenario from the store
  const currentScenario = getCurrentScenario();
  const scenarioId = currentScenario?.id;

  // Create a memoized nodeTypes object to avoid React Flow warnings
  const nodeTypes = React.useMemo(() => ({
    custom: CustomNode
  }), []);

  // Handler for edit node button click
  const handleEditNode = useCallback((nodeId: string) => {
    setActiveNodeId(nodeId);
    if (onEditNode) {
      onEditNode(nodeId);
    } else {
      // If no external handler is provided, show the built-in editor
      setShowNodeEditor(true);
    }
    // Close any other panels
    setContextMenu(null);
  }, [onEditNode, setActiveNodeId]);

  // Get latest execution data and refresh nodes
  const refreshNodeResponses = useCallback(() => {
    if (!scenarioId) {
      console.warn("Cannot refresh node responses: No scenario ID provided");
      return;
    }
    
    const execution = getLatestExecution(scenarioId);
    if (execution) {
      setNodes(nodes => nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          response: execution.results[node.id]?.output || node.data.response || ''
        }
      })));
    }
  }, [scenarioId, getLatestExecution, setNodes]);

  // Subscribe to nodeStore changes
  useEffect(() => {
    // Subscribe to nodeStore changes related to this scenario
    const unsubNodeStore = useNodeStore.subscribe((state, prevState) => {
      if (!scenarioId) return;
      
      // Check if there are new nodes for this scenario
      const prevScenarioNodes = Object.values(prevState.nodes)
        .filter(node => node.scenarioId === scenarioId);
      
      const currentScenarioNodes = Object.values(state.nodes)
        .filter(node => node.scenarioId === scenarioId);
      
      // If the node count has changed or nodes have been updated
      if (prevScenarioNodes.length !== currentScenarioNodes.length ||
          JSON.stringify(prevScenarioNodes) !== JSON.stringify(currentScenarioNodes)) {
        
        // Transform nodes from store format to ReactFlow format
        const updatedFlowNodes = currentScenarioNodes.map(node => ({
          id: node.id,
          type: 'custom',
          position: node.position,
          data: {
            ...node.data,
            label: node.data.label || node.type,
            response: node.data.response || ''
          },
        }));

        setNodes(updatedFlowNodes);
      }
    });

    // Cleanup
    return () => {
      unsubNodeStore();
    };
  }, [scenarioId, setNodes]);

  // Load nodes and edges when scenario changes
  useEffect(() => {
    console.log("Loading scenario data, scenarioId:", scenarioId);
    if (!scenarioId) {
      console.warn("Cannot load flow data: No scenario ID provided");
      return;
    }

    const scenario = getScenario(scenarioId);
    if (!scenario) {
      console.error(`Scenario ${scenarioId} not found`);
      return;
    }

    console.log(`Found scenario with ${scenario.nodeIds.length} nodes and ${scenario.edgeIds.length} edges`);

    // Transform nodes from store format to ReactFlow format
    const flowNodes = scenario.nodeIds.map(nodeId => {
      const node = getNode(nodeId);
      if (!node) return null;

      return {
        id: node.id,
        type: 'custom',
        position: node.position,
        data: {
          ...node.data,
          label: node.data.label || node.type,
          response: node.data.response || '',
          onEditNode: handleEditNode // Pass the edit handler through data prop
        },
      };
    }).filter(Boolean) as Node[];

    // Transform edges from store format to ReactFlow format
    const flowEdges = scenario.edgeIds.map(edgeId => {
      const edge = storeEdges[edgeId];
      if (!edge) return null;

      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        label: edge.label,
        type: 'smoothstep',
        animated: true
      };
    }).filter(Boolean) as Edge[];

    setNodes(flowNodes);
    setEdges(flowEdges);
    
    // Also refresh with latest execution data
    refreshNodeResponses();
  }, [scenarioId, getScenario, getNode, storeEdges, refreshNodeResponses, setNodes, setEdges, handleEditNode]);

  // Update node positions in store when dragging ends
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    updateNode(node.id, { position: { x: node.position.x, y: node.position.y } });
  }, [updateNode]);

  // Handle new connections between nodes
  const onConnect = useCallback((connection: Connection) => {
    // Create edge in store
    if (connection.source && connection.target) {
      const edgeId = createEdge(
        connection.source,
        connection.target,
        connection.sourceHandle,
        connection.targetHandle
      );
      
      // Add to scenario
      if (scenarioId) {
        addEdgeToScenario(scenarioId, edgeId);
      }
      
      // Add to flow
      setEdges((eds) => addEdge({ 
        ...connection, 
        type: 'smoothstep', 
        animated: true,
        id: edgeId 
      }, eds));
    }
  }, [createEdge, addEdgeToScenario, scenarioId, setEdges]);

  // Modified: Handle node selection to open editor directly
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setActiveNodeId(node.id);
    setShowNodeEditor(true);
    setContextMenu(null);
  }, [setActiveNodeId]);

  // Disable right-click menu by doing nothing
  const onNodeContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    // Not setting context menu anymore
  }, []);

  // Close context menu on background click
  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Execute current scenario
  const runScenario = useCallback(() => {
    if (scenarioId) {
      executeScenario(scenarioId).then(() => {
        refreshNodeResponses();
      });
    }
  }, [scenarioId, executeScenario, refreshNodeResponses]);

  if (!scenarioId) {
    return <div className="p-4 text-center text-red-500">No active scenario found. Please select or create a scenario.</div>;
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Controls />
        <Background color="#aaa" gap={16} />
        <Panel position="top-right">
          <button 
            onClick={runScenario}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Run Scenario
          </button>
        </Panel>
        <Panel position="top-left">
          <NewNodeToolbar scenarioId={scenarioId} />
        </Panel>
        
        {/* Debug info */}
        <Panel position="bottom-left" className="bg-white p-2 rounded shadow-md text-xs">
          <div>Scenario ID: {scenarioId}</div>
          <div>Nodes: {nodes.length} | Edges: {edges.length}</div>
        </Panel>
      </ReactFlow>
      
      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          onClose={() => setContextMenu(null)}
          onEdit={handleEditNode}
        />
      )}
      
      {/* Node Editor Dialog (shown when a node is clicked or edit button is clicked) */}
      {showNodeEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full">
            <NodeEditor onClose={() => setShowNodeEditor(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowEditor;