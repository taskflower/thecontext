// src/hooks/useNavigation.ts
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/useAppStore';
import { useState, useMemo, useEffect, useRef } from 'react';

export function useNavigation() {
  const navigate = useNavigate();
  const { application, workspace, scenario } = useParams();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // CRITICAL FIX: Dodaj ref dla śledzenia ostatniego przejścia, aby zapobiec podwójnym
  const lastNavigationTimeRef = useRef(0);
  
  const { 
    selectApplication, 
    selectWorkspace, 
    selectScenario, 
    getCurrentScenario,
    updateContextPath
  } = useAppStore();
  
  const currentScenario = getCurrentScenario();
  
  // CRITICAL DEBUG
  useEffect(() => {
    console.log(`[Navigation] Current step index changed to: ${currentStepIndex}`);
  }, [currentStepIndex]);
  
  // Pobierz węzły z posortowaniem
  const nodes = useMemo(() => {
    if (!currentScenario) return [];

    const unsortedNodes = currentScenario.nodes || [];
    
    // Sortuj węzły według pola order
    const sorted = [...unsortedNodes].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return 0;
    });
    
    // DEBUG
    console.log(`[Navigation] Sorted nodes:`, sorted.map(node => ({
      id: node.id, 
      template: node.template,
      order: node.order
    })));
    
    return sorted;
  }, [currentScenario]);
  
  // Aktualny węzeł i informacje o pozycji
  const currentNode = nodes[currentStepIndex];
  const isFirstNode = currentStepIndex === 0;
  const isLastNode = currentStepIndex === nodes.length - 1;
  
  // CRITICAL DEBUG
  useEffect(() => {
    console.log(`[Navigation] Current node: ${currentNode?.id} (${currentNode?.template}), isFirstNode: ${isFirstNode}, isLastNode: ${isLastNode}`);
  }, [currentNode?.id, isFirstNode, isLastNode]);
  
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
  
  // CRITICAL FIX: Nawigacja między węzłami w flow z blokadą wielokrotnych wywołań
  const handleNext = (data?: any) => {
    // Zapobiegaj wielokrotnym wywołaniom w krótkim czasie
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 1000) {
      console.log("[Navigation] Ignorowanie zbyt szybkiego wywołania handleNext");
      return;
    }
    
    lastNavigationTimeRef.current = now;
    
    console.log(`[Navigation] handleNext called with data: ${data ? 'exists' : 'null'}`);
    
    // Zapisz dane do kontekstu jeśli podano
    if (data && currentNode?.contextPath) {
      updateContextPath(currentNode.contextPath, data);
    }
    
    // Jeśli to ostatni krok, wróć do listy scenariuszy
    if (isLastNode) {
      console.log("[Navigation] Last node, navigating to workspaces");
      navigateToWorkspaces();
      return;
    }
    
    // Przejdź do następnego kroku
    console.log(`[Navigation] Moving to next step: ${currentStepIndex + 1}`);
    setCurrentStepIndex(idx => idx + 1);
  };
  
  const handleBack = () => {
    // Zapobiegaj wielokrotnym wywołaniom w krótkim czasie
    const now = Date.now();
    if (now - lastNavigationTimeRef.current < 1000) {
      console.log("[Navigation] Ignorowanie zbyt szybkiego wywołania handleBack");
      return;
    }
    
    lastNavigationTimeRef.current = now;
    
    console.log("[Navigation] handleBack called");
    
    // Jeśli to pierwszy krok, wróć do listy scenariuszy
    if (isFirstNode) {
      console.log("[Navigation] First node, navigating to workspaces");
      navigateToWorkspaces();
      return;
    }
    
    // Wróć do poprzedniego kroku
    console.log(`[Navigation] Moving to previous step: ${currentStepIndex - 1}`);
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