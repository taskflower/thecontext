/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/scenario_vizualizer/ScenarioVisualization.tsx
import React, { useCallback, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState,
  useEdgesState,
  Position,
  MarkerType,
  Handle,
  ReactFlowProvider,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useScenarioStore } from '../scenarios_module/scenarioStore';

interface ScenarioVisualizationProps {
  onNodeClick?: (id: string) => void;
}

// Custom Node Component
const ScenarioNode = ({ data }: any) => {
  // Light background with colored accents
  const bgColor = 'white';
  const borderColor = data.hasResponse ? 'hsl(142 70% 45%)' : `hsl(${data.hue} 95% 39%)`;
  
  return (
    <div className="relative" style={{ width: '150px' }}>
      <Handle type="target" position={Position.Left} />
      <div 
        className="p-3 rounded-md shadow-md border border-solid"
        style={{ 
          borderColor: borderColor,
          backgroundColor: bgColor,
        }}
      >
        {/* Category badge */}
        <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-white"
          style={{ backgroundColor: `hsl(${data.hue} 95% 39%)` }}>
          {data.category}
        </div>
        
        {/* Response indicator */}
        {data.hasResponse && (
          <div className="absolute -top-1 -left-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-white bg-green-500">
            Response
          </div>
        )}
        
        {/* Node ID */}
        <div 
          className="text-xs font-medium mb-1 text-center truncate" 
          style={{ color: `hsl(${data.hue} 95% 39%)` }}
          title={data.id}
        >
          {data.id}
        </div>
        
        {/* Message preview */}
        <div 
          className="text-xs text-gray-600 text-center overflow-hidden"
          style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis'
          }}
          title={data.message}
        >
          {data.message}
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
      
      {/* Line under the box */}
      <div className="w-full h-px bg-gray-200 mt-1"></div>
    </div>
  );
};

// Define node types
const nodeTypes = {
  scenarioNode: ScenarioNode,
};

// Main component
const ScenarioVisualizationInner: React.FC<ScenarioVisualizationProps> = ({ onNodeClick }) => {
  const { nodes: storeNodes, edges: storeEdges, nodeResponses } = useScenarioStore();

  // Color scale for categories - using HSL hues for better control with NY style
  const categoryColorMap = useMemo(() => {
    const categories = new Set(Object.values(storeNodes).map(node => node.category));
    // HSL hue values
    const hues = [
      210, // blue
      25,  // orange
      142, // green
      354, // red
      280, // purple
      14,  // brown
      330, // pink
      220, // indigo
      54,  // yellow
      190  // cyan
    ];
    
    const colorMap: Record<string, number> = {};
    Array.from(categories).forEach((category, index) => {
      colorMap[category] = hues[index % hues.length];
    });
    
    return colorMap;
  }, [storeNodes]);

  // Transform store data to ReactFlow format
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes = Object.values(storeNodes).map(node => ({
      id: node.id,
      type: 'scenarioNode',
      position: { x: 0, y: 0 }, // will be arranged by layout
      data: {
        id: node.id,
        category: node.category,
        message: node.message,
        hasResponse: !!nodeResponses[node.id],
        hue: categoryColorMap[node.category]
      }
    }));

    const edges = storeEdges.map(edge => ({
      id: `e-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      style: { stroke: '#94a3b8', strokeOpacity: 0.6, strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#94a3b8',
      },
      type: 'smoothstep' // Use curved edges
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [storeNodes, storeEdges, nodeResponses, categoryColorMap]);

  // Initialize nodes and edges state with the transformed data
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges,, onEdgesChange] = useEdgesState(initialEdges);

  // Node click handler
  const handleNodeClick = useCallback((_event: React.MouseEvent, node: any) => {
    if (onNodeClick) {
      onNodeClick(node.id);
    }
  }, [onNodeClick]);

  // Auto-layout setup
  const getLayoutedElements = useCallback(() => {
    // This is a very simple layout strategy
    // You might want to use a more sophisticated layout algorithm like dagre or elk
    // For demo purposes, we'll use a simple grid layout
    const nodeWidth = 150;
    const nodeHeight = 80;
    const gapX = 200;
    const gapY = 150;
    const nodesPerRow = 3;
    
    const newNodes = [...nodes];
    
    newNodes.forEach((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      node.position = {
        x: col * (nodeWidth + gapX) + 100,
        y: row * (nodeHeight + gapY) + 100
      };
    });
    
    return { nodes: newNodes, edges };
  }, [nodes, edges]);

  // Apply layout on initial render
  React.useEffect(() => {
    const { nodes: layoutedNodes } = getLayoutedElements();
    setNodes([...layoutedNodes]);
  }, [getLayoutedElements, setNodes]);

  return (
    <div className="w-full h-[50vh] bg-gray-50 rounded border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="#f1f5f9" gap={16} />
        <Controls 
          className="bg-white border border-gray-200 text-gray-700"
        />
        <Panel position="top-right">
          <div className="p-3 bg-white rounded-md shadow-sm border border-gray-200 text-gray-700 text-xs">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-semibold mb-1">Categories</div>
              {Object.entries(categoryColorMap).map(([category, hue]) => (
                <div key={category} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: `hsl(${hue} 95% 39%)` }}
                  ></div>
                  <span>{category}</span>
                </div>
              ))}
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Has Response</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Wrapper with ReactFlowProvider
const ScenarioVisualization: React.FC<ScenarioVisualizationProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ScenarioVisualizationInner {...props} />
    </ReactFlowProvider>
  );
};

export default ScenarioVisualization;