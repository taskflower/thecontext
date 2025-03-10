// src/modules/GraphVisualization.tsx
import React from 'react';
import { useGraphStore } from '../graph_module/graphStore';

interface GraphVisualizationProps {
  onNodeClick: (id: string) => void;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({ onNodeClick }) => {
  const { nodes, edges, nodeResponses } = useGraphStore();
  
  const renderFlowGraph = () => {
    const canvasWidth = 800;
    const canvasHeight = 500;
    const nodeWidth = 180;
    const nodeHeight = 60;
    
    // Automatyczne rozmieszczanie węzłów
    const nodePositions: Record<string, { x: number; y: number }> = {};
    const nodeIds = Object.keys(nodes);
    
    // Wyznaczanie poziomów węzłów
    const nodeLevels: Record<string, number> = {};
    const startNodes = nodeIds.filter(id => 
      !edges.some(edge => edge.target === id)
    );
    
    nodeIds.forEach(id => {
      nodeLevels[id] = 0;
    });
    
    const calculateLevels = (nodeId: string, level: number) => {
      if (nodeLevels[nodeId] < level) {
        nodeLevels[nodeId] = level;
      }
      const outgoingNodes = edges
        .filter(edge => edge.source === nodeId)
        .map(edge => edge.target);
      outgoingNodes.forEach(targetId => {
        calculateLevels(targetId, level + 1);
      });
    };
    
    startNodes.forEach(startNodeId => {
      calculateLevels(startNodeId, 0);
    });
    
    const levelGroups: Record<string, string[]> = {};
    Object.entries(nodeLevels).forEach(([nodeId, level]) => {
      if (!levelGroups[level]) {
        levelGroups[level] = [];
      }
      levelGroups[level].push(nodeId);
    });
    
    const levels = Object.keys(levelGroups).sort((a, b) => parseInt(a) - parseInt(b));
    const horizontalSpacing = canvasWidth / (Math.max(levels.length, 1));
    
    levels.forEach((level, levelIndex) => {
      const nodesInLevel = levelGroups[level];
      const verticalSpacing = canvasHeight / (Math.max(nodesInLevel.length, 1));
      nodesInLevel.forEach((nodeId, nodeIndex) => {
        nodePositions[nodeId] = {
          x: horizontalSpacing * levelIndex + horizontalSpacing / 2 - nodeWidth / 2,
          y: verticalSpacing * nodeIndex + verticalSpacing / 2 - nodeHeight / 2
        };
      });
    });
    
    return (
      <div className="overflow-auto border rounded p-2 bg-white" style={{ maxWidth: '100%', height: '500px' }}>
        <div style={{ position: 'relative', width: canvasWidth, height: canvasHeight }}>
          {/* Rysowanie krawędzi */}
          {edges.map((edge, index) => {
            if (!nodePositions[edge.source] || !nodePositions[edge.target]) return null;
            
            const sourcePos = nodePositions[edge.source];
            const targetPos = nodePositions[edge.target];
            const startX = sourcePos.x + nodeWidth;
            const startY = sourcePos.y + nodeHeight / 2;
            const endX = targetPos.x;
            const endY = targetPos.y + nodeHeight / 2;
            const controlX = (startX + endX) / 2;
            
            return (
              <div key={`edge-${index}`} style={{ 
                position: 'absolute',
                pointerEvents: 'none',
                width: '100%',
                height: '100%',
                zIndex: 1
              }}>
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                  <path 
                    d={`M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`} 
                    stroke="#888" 
                    strokeWidth="2" 
                    fill="none" 
                    markerEnd="url(#arrowhead)" 
                  />
                  <defs>
                    <marker 
                      id="arrowhead" 
                      markerWidth="10" 
                      markerHeight="7" 
                      refX="9" 
                      refY="3.5" 
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
                    </marker>
                  </defs>
                </svg>
              </div>
            );
          })}
          
          {/* Renderowanie węzłów */}
          {Object.entries(nodes).map(([id, node]) => {
            const pos = nodePositions[id] || { x: 0, y: 0 };
            const hasResponse = nodeResponses[id] !== undefined;
            const isScenario = node.category === 'scenario';
            const categoryColor = isScenario ? '#fffbcc' : {
              'default': '#e5e7eb',
              'procesy': '#dbeafe',
            }[node.category] || '#f3f4f6';
            
            return (
              <div
                key={`node-${id}`}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: nodeWidth,
                  height: nodeHeight,
                  backgroundColor: categoryColor,
                  border: hasResponse ? '2px solid #10b981' : '1px solid #ccc',
                  borderRadius: '4px',
                  padding: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  zIndex: 2
                }}
                onClick={() => onNodeClick(id)}
              >
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px', color: '#333' }}>
                  {id} {isScenario && <span style={{ fontSize: '10px', color: '#d97706' }}>[Scenariusz]</span>}
                  {hasResponse && <span style={{ marginLeft: '5px', color: '#10b981' }}>✓</span>}
                </div>
                <div style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {node.message.length > 30 ? `${node.message.substring(0, 30)}...` : node.message}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="text-sm text-gray-500 mb-2">
        Kliknij na węzeł, aby zobaczyć podgląd promptu. Węzły z zielonym obramowaniem mają już zapisane odpowiedzi.
      </div>
      {renderFlowGraph()}
    </div>
  );
};

export default GraphVisualization;
