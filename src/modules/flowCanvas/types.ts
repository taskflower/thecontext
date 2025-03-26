/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node, Edge as ReactFlowEdge, NodeTypes } from "reactflow";
import { FlowNode, Edge } from "../graph/types";

/**
 * Rozszerzony interfejs FlowNode z dodatkowymi właściwościami wymaganymi 
 * przez komponent wizualizacji przepływu
 */
export interface ExtendedFlowNode extends FlowNode {
  nodeType?: string;
  value?: string | number | null;
}

/**
 * Interfejs definiujący konwersję danych z modelu aplikacji do modelu ReactFlow
 */
export interface FlowCanvasAdapters {
  adaptNodeToReactFlow: (node: FlowNode, isSelected: boolean) => Node;
  adaptEdgeToReactFlow: (edge: Edge) => ReactFlowEdge;
}

/**
 * Interfejs definiujący handlery zdarzeń dla ReactFlow
 */
export interface FlowCanvasHandlers {
  onConnect: (connection: any) => void;
  onNodeDragStop: (event: React.MouseEvent, node: Node) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
}

/**
 * Konfiguracja dla komponentu FlowCanvas
 */
export interface FlowCanvasConfig {
  nodeTypes: NodeTypes;
  gridSize: number;
  maxZoom: number;
}