// src/hooks/useNavigation.ts
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/useAppStore';
import { useState, useMemo, useRef } from 'react';

export function useNavigation() {
  const navigate = useNavigate();
  const { application, workspace, scenario } = useParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // CRITICAL FIX: Add ref to track last navigation to prevent double calls
  const lastNavigationTimeRef = useRef(0);
  
  const { 
    selectApplication, 
    selectWorkspace, 
    selectScenario, 
    getCurrentScenario,
    updateContextPath
  } = useAppStore();
  
  const currentScenario = getCurrentScenario();
  
  // Get nodes with sorting
  const nodes = useMemo(() => {
    if (!currentScenario) return [];

    const unsortedNodes = currentScenario.nodes || [];
    
    // Sort nodes by order field
    const sorted = [...unsortedNodes].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return 0;
    });
    
    return sorted;
  }, [currentScenario]);
  
  // Current node and position information
  const currentNode = nodes[currentStepIndex];
  const isFirstNode = currentStepIndex === 0;
  const isLastNode = currentStepIndex === nodes.length - 1;
  
  // Page navigation
  const navigateToHome = () => navigate('/');
  
  const navigateToApplications = () => {
    if (application) {
      selectApplication(application);
      navigate(`/app/${application}`);
    } else {
      navigateToHome();
    }
  };
  
  const navigateToWorkspaces = () => {
    if (workspace) {
      selectWorkspace(workspace);
      navigate(`/${workspace}`);
    } else {
      navigateToApplications();
    }
  };
  
  const navigateToScenario = (scenarioId: string) => {
    if (workspace) {
      selectScenario(scenarioId);
      navigate(`/${workspace}/${scenarioId}`);
      setCurrentStepIndex(0); // Reset to first step
    }
  };
  
  // CRITICAL FIX: Node navigation in flow with protection against multiple calls
  const handleNext = (data?: any) => {
    // Prevent multiple calls in short time
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 1000) {
      return;
    }
    
    lastNavigationTimeRef.current = now;
    
    // Save data to context if provided
    if (data && currentNode?.contextPath) {
      updateContextPath(currentNode.contextPath, data);
    }
    
    // If this is the last step, return to scenario list
    if (isLastNode) {
      navigateToWorkspaces();
      return;
    }
    
    // Go to next step
    setCurrentStepIndex(idx => idx + 1);
  };
  
  const handleBack = () => {
    // Prevent multiple calls in short time
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 1000) {
      return;
    }
    
    lastNavigationTimeRef.current = now;
    
    // If this is the first step, return to scenario list
    if (isFirstNode) {
      navigateToWorkspaces();
      return;
    }
    
    // Go to previous step
    setCurrentStepIndex(idx => idx - 1);
  };
  
  return {
    // Page navigation
    navigateToHome,
    navigateToApplications,
    navigateToWorkspaces,
    navigateToScenario,
    
    // Flow navigation
    currentNode,
    isFirstNode,
    isLastNode,
    handleNext,
    handleBack,
    
    // URL parameters
    params: { application, workspace, scenario }
  };
}