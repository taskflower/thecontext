import { useState, useCallback } from 'react';
import { Node } from '@/modules/modules';

export const useFlowNavigation = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState<Node[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const startFlow = useCallback((path: Node[]) => {
    if (path.length > 0) {
      setSteps(path);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    }
  }, []);
  
  const nextStep = useCallback(() => {
    setCurrentStepIndex(prevIndex => Math.min(prevIndex + 1, steps.length - 1));
  }, [steps.length]);
  
  const prevStep = useCallback(() => {
    setCurrentStepIndex(prevIndex => Math.max(prevIndex - 1, 0));
  }, []);
  
  const stopFlow = useCallback(() => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(0);
  }, []);
  
  return {
    isPlaying,
    steps,
    currentStepIndex,
    startFlow,
    nextStep,
    prevStep,
    stopFlow
  };
};