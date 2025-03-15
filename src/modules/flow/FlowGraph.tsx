import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { useEdgeStore } from "../edges/edgeStore";

import { FlowPlayer } from "./FlowPlayer";
import { useFlowStore } from "./flowStore";
import { useNodeStore } from "../nodes";
import { useWorkspaceStore } from "../workspaces";


export const FlowGraph: React.FC = () => {
  const getActiveScenarioData = useFlowStore(state => state.getActiveScenarioData);
  const addEdge = useEdgeStore(state => state.addEdge);
  const updateNodePosition = useNodeStore(state => state.updateNodePosition);
  const stateVersion = useWorkspaceStore(state => state.stateVersion);
  const selectedWorkspace = useWorkspaceStore(state => state.selected.workspace);
  const selectedScenario = useWorkspaceStore(state => state.selected.scenario);
  
  const { nodes: initialNodes, edges: initialEdges } = getActiveScenarioData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update the graph when data changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getActiveScenarioData();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [getActiveScenarioData, stateVersion, selectedWorkspace, selectedScenario, setNodes, setEdges]);

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

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

  return (
    <div className="bg-white rounded-md p-0 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={16} />
      </ReactFlow>

      <FlowPlayer />
    </div>
  );
};
