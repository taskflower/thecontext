import React, { useCallback, useState } from 'react';
import { useAppStore } from '../store';
import { StepModal } from '@/components/APPUI';
import { GraphNode } from '../types';
import { calculateFlowPath } from './flowUtils';

export const FlowPlayer: React.FC = () => {
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [flowPath, setFlowPath] = useState<GraphNode[]>([]);
  
  const handlePlay = useCallback(() => {
    const scenario = getCurrentScenario();
    if (scenario) {
      const path = calculateFlowPath(scenario.children, scenario.edges);
      if (path.length > 0) {
        setFlowPath(path);
        setCurrentNodeIndex(0);
        setIsPlaying(true);
      }
    }
  }, [getCurrentScenario]);
  
  const handleNext = () => {
    setCurrentNodeIndex(prev => Math.min(prev + 1, flowPath.length - 1));
  };
  
  const handlePrev = () => {
    setCurrentNodeIndex(prev => Math.max(prev - 1, 0));
  };
  
  const handleClose = () => {
    setIsPlaying(false);
  };
  
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
      
      {isPlaying && flowPath.length > 0 && (
        <StepModal 
          steps={flowPath}
          currentStep={currentNodeIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={handleClose}
        />
      )}
    </>
  );
};