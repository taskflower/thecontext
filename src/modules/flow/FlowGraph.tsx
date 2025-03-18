// src/modules/flow/FlowGraph.tsx
import React, { useMemo, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  SelectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import './flowStyle.css';
import CustomNode from './CustomNode';
import { Button } from '@/components/ui/button';
import { FilterIcon } from 'lucide-react';
import { FilterEditor } from '../filters/FilterEditor';
import { useFlow } from './useFlow';
import { FlowPlayer } from './FlowPlayer';

export const FlowGraph: React.FC = () => {
  const {
    flowData,
    selected,
    onConnect,
    onNodePositionChange,
    onSelectionChange,
    onPaneClick
  } = useFlow();

  // State for filter editor
  const [showFilterEditor, setShowFilterEditor] = useState(false);
  
  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState(flowData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowData.edges);
  
  // Aktualizuj nodes i edges przy zmianie danych
  React.useEffect(() => {
    const typedNodes = flowData.nodes.map(node => ({
      ...node,
      type: 'default' // Użyj CustomNode dla wszystkich węzłów
    }));
    
    setNodes(typedNodes);
    setEdges(flowData.edges);
  }, [flowData, setNodes, setEdges]);
  
  // Aktualizuj zaznaczenie dla nodes
  React.useEffect(() => {
    if (selected.node) {
      setNodes(nds => 
        nds.map(node => ({
          ...node,
          selected: node.id === selected.node
        }))
      );
      setEdges(eds =>
        eds.map(edge => ({
          ...edge,
          selected: false
        }))
      );
    }
  }, [selected.node, setNodes, setEdges]);

  // Aktualizuj zaznaczenie dla edges
  React.useEffect(() => {
    if (selected.edge) {
      setEdges(eds =>
        eds.map(edge => ({
          ...edge,
          selected: edge.id === selected.edge
        }))
      );
      setNodes(nds =>
        nds.map(node => ({
          ...node,
          selected: false
        }))
      );
    }
  }, [selected.edge, setNodes, setEdges]);
  
  // Obsługa połączenia węzłów
  const handleConnect = (connection: Connection) => {
    if (connection.source && connection.target) {
      onConnect(connection.source, connection.target);
    }
  };
  
  // Typy węzłów
  const nodeTypes = useMemo(() => ({
    default: CustomNode,
  }), []);
  
  return (
    <div className="bg-card rounded-md p-0 h-full relative">
      {/* Filter Editor Button */}
      <div className="absolute top-4 left-4 z-10">
        <Button 
          size="sm" 
          onClick={() => setShowFilterEditor(true)} 
          className="px-3 py-2 space-x-1"
          disabled={!selected.scenario}
          variant="outline"
        >
          <FilterIcon className="h-4 w-4 mr-1" />
          <span>Filters {!selected.scenario && '(Select Scenario)'}</span>
        </Button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeDragStop={(_, node) => onNodePositionChange(node.id, node.position)}
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
      
      {/* Render filter editor when needed */}
      {showFilterEditor && selected.scenario && (
        <FilterEditor
          scenarioId={selected.scenario}
          onClose={() => setShowFilterEditor(false)}
        />
      )}
    </div>
  );
};