/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node, Edge as ReactFlowEdge } from "reactflow";
import { FlowNode, Edge } from "../graph/types";

/**
 * Adapter do konwersji FlowNode na format ReactFlow
 */
export const adaptNodeToReactFlow = (node: FlowNode, isSelected: boolean): Node => ({
  id: node.id,
  type: "custom",
  data: {
    label: node.label,
    nodeId: node.id,
    prompt: node.userPrompt,
    message: node.assistantMessage,
    pluginKey: node.pluginKey,
    // Bezpiecznie obsługujemy potencjalnie brakujące właściwości
    nodeType: (node as any).nodeType || 'Default',
    value: (node as any).value || null,
  },
  position: node.position,
  selected: isSelected,
});

/**
 * Adapter do konwersji Edge na format ReactFlow
 */
export const adaptEdgeToReactFlow = (edge: Edge): ReactFlowEdge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  label: edge.label,
  type: "step",
  style: {
    strokeDasharray: 5,
    strokeWidth: 2,
    animation: "dashMove 5s linear infinite",
  },
});