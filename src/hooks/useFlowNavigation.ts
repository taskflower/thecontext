// src/hooks/useFlowNavigation.ts
import { useState, useCallback } from 'react';
import { Node } from '@/types/app';

export const useFlowNavigation = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<Node[]>([]);

  const startFlow = useCallback((path: Node[]) => {
    if (path && path.length > 0) {
      setSteps(path);
      setCurrentStepIndex(0);
      setIsPlaying(true);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const stopFlow = useCallback(() => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(0);
  }, []);

  return {
    isPlaying,
    currentStepIndex,
    steps,
    startFlow,
    nextStep,
    prevStep,
    stopFlow
  };
};