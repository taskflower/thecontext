/* eslint-disable @typescript-eslint/no-explicit-any */
// components/features/flow/FlowPlayer.tsx
import { StepModal } from '@/components/APPUI';
import { useFlowNavigation } from '@/hooks';
import { useAppStore } from '@/store';
import { useCallback } from 'react';
import { Node } from '@/types/app';

// Helper function to calculate flow path
const calculateFlowPath = (scenario: any): Node[] => {
  if (!scenario) return [];
  
  const { children: nodes = [], edges = [] } = scenario;
  
  // Create node incoming edge count map
  const incomingMap = new Map();
  edges.forEach((edge: any) => {
    incomingMap.set(edge.target, (incomingMap.get(edge.target) || 0) + 1);
  });
  
  // Find start node (outgoing edges but no incoming)
  let startNodeId = null;
  for (const node of nodes) {
    const hasOutgoing = edges.some((edge: any) => edge.source === node.id);
    const incomingCount = incomingMap.get(node.id) || 0;
    
    if (hasOutgoing && incomingCount === 0) {
      startNodeId = node.id;
      break;
    }
  }
  
  // If no clear start, take first node
  if (!startNodeId && nodes.length > 0) {
    startNodeId = nodes[0].id;
  }
  
  if (!startNodeId) return [];
  
  // Create graph adjacency map
  const edgesMap = new Map();
  edges.forEach((edge: any) => {
    if (!edgesMap.has(edge.source)) edgesMap.set(edge.source, []);
    edgesMap.get(edge.source).push(edge.target);
  });
  
  // Trace path with DFS
  const path: Node[] = [];
  const visited = new Set();
  
  const dfs = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    
    const nodeData = nodes.find((n: any) => n.id === nodeId);
    if (nodeData) {
      path.push(nodeData);
      visited.add(nodeId);
      
      const nextNodes = edgesMap.get(nodeId) || [];
      for (const next of nextNodes) dfs(next);
    }
  };
  
  dfs(startNodeId);
  return path;
};

export const FlowPlayer: React.FC = () => {
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  
  const {
    isPlaying,
    currentStepIndex,
    steps,
    startFlow,
    nextStep,
    prevStep,
    stopFlow
  } = useFlowNavigation();
  
  const handlePlay = useCallback(() => {
    const scenario = getCurrentScenario();
    if (scenario) {
      const path = calculateFlowPath(scenario);
      startFlow(path);
    }
  }, [getCurrentScenario, startFlow]);
  
  return (
    <>
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={handlePlay}
          className="p-2 rounded-md bg-blue-500 text-white text-xs font-medium hover:bg-blue-600"
        >
          Play Flow
        </button>
      </div>
      
      {isPlaying && steps.length > 0 && (
        <StepModal 
          steps={steps}
          currentStep={currentStepIndex}
          onNext={nextStep}
          onPrev={prevStep}
          onClose={stopFlow}
        />
      )}
    </>
  );
};