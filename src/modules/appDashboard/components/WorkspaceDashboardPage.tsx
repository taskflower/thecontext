import React, { useEffect, useMemo } from 'react';
import Dashboard from './Dashboard';
import { useDashboardStore, useSelectedDashboardId } from '../dashboardStore';
import { useAppStore } from '@/modules/store';

interface WorkspaceDashboardPageProps {
  workspaceId?: string;
  hideCreateButton?: boolean;
  forceDashboardId?: string; // Dodano parametr do wymuszenia konkretnego dashboardu
}

const WorkspaceDashboardPage: React.FC<WorkspaceDashboardPageProps> = ({ 
  workspaceId,
  hideCreateButton,
  forceDashboardId
}) => {
  // Użyj indywidualnych selectorów zamiast obiektu
  const selectedDashboardId = useSelectedDashboardId();
  
  // Memoizuj funkcje ze store
  const getDashboardByWorkspaceId = useMemo(() => 
    useDashboardStore.getState().getDashboardByWorkspaceId, 
  []);
  
  const setSelectedDashboard = useMemo(() => 
    useDashboardStore.getState().setSelectedDashboard, 
  []);
  
  // Użyj custom selectora, aby reagować na zmiany workspace
  const currentWorkspaceId = useAppStore(state => 
    workspaceId ? workspaceId : state.selected.workspace
  );
  
  // Pobierz dashboard dla workspace, ale tylko jeśli nie wymuszono konkretnego dashboardu
  const workspaceDashboard = useMemo(() => {
    if (forceDashboardId) return null;
    if (currentWorkspaceId) {
      return getDashboardByWorkspaceId(currentWorkspaceId);
    }
    return null;
  }, [currentWorkspaceId, getDashboardByWorkspaceId, forceDashboardId]);
  
  // Efekt do ustawiania wybranego dashboardu - ZNACZNIE UPROSZCZONY
  useEffect(() => {
    // Jeśli wymuszono konkretny dashboard, użyj go
    if (forceDashboardId) {
      setSelectedDashboard(forceDashboardId);
    }
    // Nie ustawiamy dashboardu workspace tutaj, to robi komponent WorkspaceDashboard
  }, [forceDashboardId, setSelectedDashboard]);
  
  // Uzyskaj aktualny dashboardId do przekazania do komponentu Dashboard
  // Priorytetyzuj: 1) wymuszony dashboard, 2) dashboard powiązany z workspace, 3) ostatnio wybrany dashboard
  const currentDashboardId = useMemo(() => {
    // Jeśli wymuszono konkretny dashboard, użyj go
    if (forceDashboardId) {
      return forceDashboardId;
    }
    
    // Jeśli mamy dashboard dla bieżącego workspace, użyj go
    if (workspaceDashboard?.id) {
      return workspaceDashboard.id;
    }
    
    // Jeśli nie mamy dashboardu dla workspace, sprawdź czy wybrany dashboard
    // ma pasować do bieżącego workspace
    if (selectedDashboardId && currentWorkspaceId) {
      const dashboard = useDashboardStore.getState().getDashboard(selectedDashboardId);
      // Użyj tylko jeśli jest globalny (brak workspaceId) lub ma pasujący workspaceId
      if (dashboard && (!dashboard.workspaceId || dashboard.workspaceId === currentWorkspaceId)) {
        return selectedDashboardId;
      }
      // W przeciwnym razie nie pokazuj żadnego dashboardu
      return null;
    }
    
    // Użyj ostatnio wybranego dashboardu jako fallback
    return selectedDashboardId;
  }, [forceDashboardId, workspaceDashboard?.id, selectedDashboardId, currentWorkspaceId]);
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        {/* Dodatkowe UI można tu umieścić, np. przyciski akcji */}
      </div>
      <div className="flex-1 overflow-hidden">
        <Dashboard dashboardId={currentDashboardId} />
      </div>
    </div>
  );
};

export default WorkspaceDashboardPage;