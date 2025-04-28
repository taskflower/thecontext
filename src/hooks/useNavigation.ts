// src/hooks/useNavigation.ts
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/useAppStore';
import { useState, useMemo } from 'react';

export function useNavigation() {
  const navigate = useNavigate();
  const { application, workspace, scenario } = useParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  
  const { 
    selectApplication, 
    selectWorkspace, 
    selectScenario, 
    getCurrentScenario,
    updateContextPath
  } = useAppStore();
  
  const currentScenario = getCurrentScenario();
  
  // Pobierz węzły z posortowaniem
  const nodes = useMemo(() => {
    if (!currentScenario) return [];

    const unsortedNodes = currentScenario.nodes || [];
    
    // Sortuj węzły według pola order
    return [...unsortedNodes].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return 0;
    });
  }, [currentScenario]);
  
  // Aktualny węzeł i informacje o pozycji
  const currentNode = nodes[currentStepIndex];
  const isFirstNode = currentStepIndex === 0;
  const isLastNode = currentStepIndex === nodes.length - 1;
  
  // Nawigacja między stronami
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
      setCurrentStepIndex(0); // Reset do pierwszego kroku
    }
  };
  
  // Nawigacja między węzłami w flow
  const handleNext = (data?: any) => {
    // Zapisz dane do kontekstu jeśli podano
    if (data && currentNode?.contextPath) {
      updateContextPath(currentNode.contextPath, data);
    }
    
    // Jeśli to ostatni krok, wróć do listy scenariuszy
    if (isLastNode) {
      navigateToWorkspaces();
      return;
    }
    
    // Przejdź do następnego kroku
    setCurrentStepIndex(idx => idx + 1);
  };
  
  const handleBack = () => {
    // Jeśli to pierwszy krok, wróć do listy scenariuszy
    if (isFirstNode) {
      navigateToWorkspaces();
      return;
    }
    
    // Wróć do poprzedniego kroku
    setCurrentStepIndex(idx => idx - 1);
  };
  
  return {
    // Nawigacja między stronami
    navigateToHome,
    navigateToApplications,
    navigateToWorkspaces,
    navigateToScenario,
    
    // Nawigacja w flow
    currentNode,
    isFirstNode,
    isLastNode,
    handleNext,
    handleBack,
    
    // Parametry URL
    params: { application, workspace, scenario }
  };
}