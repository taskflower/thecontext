/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useRef, useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  NodeDragHandler,
  SelectionMode,
  OnSelectionChangeParams,
  NodeTypes
} from "reactflow";
import CustomNode from "./CustomNode";
import "reactflow/dist/style.css";
import "./flowStyle.css";
import { useAppStore } from "../store";
import { FlowPlayer } from "./FlowPlayer";

export const FlowGraph: React.FC = () => {
  const getActiveScenarioData = useAppStore(state => state.getActiveScenarioData);
  const addEdge = useAppStore(state => state.addEdge);
  const updateNodePosition = useAppStore(state => state.updateNodePosition);
  const selectNode = useAppStore(state => state.selectNode);
  const selectEdge = useAppStore(state => state.selectEdge);
  const clearSelection = useAppStore(state => state.clearSelection);
  const selected = useAppStore(state => state.selected);
  const stateVersion = useAppStore(state => state.stateVersion);
  
  // Reference to the ReactFlow wrapper div
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const { nodes: initialNodes, edges: initialEdges } = getActiveScenarioData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Memoize nodeTypes to prevent recreating on each render
  const nodeTypes = useMemo<NodeTypes>(() => ({
    default: CustomNode,
  }), []);
  
  // Split effects to avoid render loops
  // Effect 1: Update nodes and edges when data changes (not on selection)
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getActiveScenarioData();
    
    // Make sure all nodes use the 'default' type to apply our CustomNode
    const typedNodes = newNodes.map(node => ({
      ...node,
      type: 'default' // This ensures all nodes use our CustomNode
    }));
    
    setNodes(typedNodes);
    setEdges(newEdges);
  }, [getActiveScenarioData, setNodes, setEdges, stateVersion]); // Removed selected from dependencies
  
  // Effect 2: Update visual selection for nodes
  useEffect(() => {
    if (selected.node) {
      setNodes((nds) => 
        nds.map((node) => ({
          ...node,
          selected: node.id === selected.node
        }))
      );
      // Deselect any edges when a node is selected
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          selected: false
        }))
      );
    }
  }, [selected.node, setNodes, setEdges]);

  // Effect 3: Update visual selection for edges
  useEffect(() => {
    if (selected.edge) {
      setEdges((eds) =>
        eds.map((edge) => ({
          ...edge,
          selected: edge.id === selected.edge
        }))
      );
      // Deselect any nodes when an edge is selected
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: false
        }))
      );
    }
  }, [selected.edge, setNodes, setEdges]);
  
  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addEdge({
          source: params.source,
          target: params.target,
        });
      }
    },
    [addEdge]
  );
  
  const onNodeDragStop = useCallback<NodeDragHandler>(
    (event, node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );
  
  // Use only ReactFlow's built-in selection handling
  const onSelectionChange = useCallback(
    ({ nodes, edges }: OnSelectionChangeParams) => {
      if (nodes.length > 0) {
        // A node was selected
        selectNode(nodes[0].id);
      } else if (edges.length > 0) {
        // An edge was selected
        selectEdge(edges[0].id);
      } else {
        // Nothing selected, clear selection
        clearSelection();
      }
    },
    [selectNode, selectEdge, clearSelection]
  );
  
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        clearSelection();
      }
    },
    [clearSelection]
  );
  
  return (
    <div 
      className="bg-card rounded-md p-0 h-full relative"
      ref={reactFlowWrapper}
      // Removed custom mousedown handler to avoid selection conflicts
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
        selectionMode={SelectionMode.Full}
        selectionOnDrag={false}
        multiSelectionKeyCode={null}
        panOnDrag={true}
        className="flow-container"
        nodeTypes={nodeTypes}
      >
        <Controls />
        <MiniMap />
        <Background gap={16} size={1} className="flow-background" />
      </ReactFlow>
      
      <FlowPlayer />
    </div>
  );
};