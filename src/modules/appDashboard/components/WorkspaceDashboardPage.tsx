import React, { useEffect, useMemo } from 'react';
import Dashboard from './Dashboard';
import { useDashboardStore, useSelectedDashboardId } from '../dashboardStore';
import { useAppStore } from '@/modules/store';
import { Button } from '@/components/ui/button';
import { usePanelStore } from '@/modules/PanelStore';

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
  
  // Pobierz wszystkie dashboardy
  const allDashboards = useDashboardStore(state => state.dashboards);

  // Filtruj dashboardy dostępne dla bieżącego workspace
  const availableDashboards = useMemo(() => {
    // Jeśli nie ma workspace, pokaż tylko globalne dashboardy
    if (!currentWorkspaceId) {
      return allDashboards.filter(d => !d.workspaceId);
    }
    
    // Jeśli jest workspace, pokaż dashboardy dla tego workspace oraz globalne
    return allDashboards.filter(d => 
      !d.workspaceId || d.workspaceId === currentWorkspaceId
    );
  }, [allDashboards, currentWorkspaceId]);
  
  // Uzyskaj aktualny dashboardId do przekazania do komponentu Dashboard
  // Priorytetyzuj: 1) wymuszony dashboard, 2) dashboard powiązany z workspace, 3) ostatnio wybrany dashboard
  const currentDashboardId = useMemo(() => {
    // Jeśli wymuszono konkretny dashboard, sprawdź czy jest dostępny dla tego workspace
    if (forceDashboardId) {
      const forcedDashboard = allDashboards.find(d => d.id === forceDashboardId);
      if (!forcedDashboard) return null;
      
      // Jeśli dashboard ma przypisany workspace, sprawdź czy pasuje do bieżącego
      if (forcedDashboard.workspaceId && forcedDashboard.workspaceId !== currentWorkspaceId) {
        return null; // Dashboard przypisany do innego workspace
      }
      
      return forceDashboardId;
    }
    
    // Jeśli mamy dashboard dla bieżącego workspace, użyj go
    if (workspaceDashboard?.id) {
      return workspaceDashboard.id;
    }
    
    // Jeśli jest wybrany dashboard, sprawdź czy jest dostępny dla tego workspace
    if (selectedDashboardId) {
      const isAvailable = availableDashboards.some(d => d.id === selectedDashboardId);
      if (isAvailable) {
        return selectedDashboardId;
      }
    }
    
    // Jeśli nie ma wybranego lub dopasowanego dashboardu, wybierz pierwszy dostępny
    if (availableDashboards.length > 0) {
      // Najpierw szukaj dashboardu dla tego workspace
      const workspaceDash = availableDashboards.find(d => d.workspaceId === currentWorkspaceId);
      if (workspaceDash) {
        return workspaceDash.id;
      }
      // W przeciwnym razie użyj pierwszego globalnego
      return availableDashboards[0].id;
    }
    
    // Brak dostępnych dashboardów
    return null;
  }, [forceDashboardId, workspaceDashboard?.id, selectedDashboardId, availableDashboards, allDashboards, currentWorkspaceId]);
  
  // Handler do zmiany dashboardu
  const handleDashboardChange = (dashboardId: string) => {
    setSelectedDashboard(dashboardId);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Dropdown do wyboru dashboardu */}
          {availableDashboards.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Dashboard:</label>
              <select 
                className="text-sm border rounded px-2 py-1 bg-background"
                value={currentDashboardId || ''}
                onChange={(e) => handleDashboardChange(e.target.value)}
              >
                {availableDashboards.map(dashboard => (
                  <option key={dashboard.id} value={dashboard.id}>
                    {dashboard.name}
                    {dashboard.workspaceId ? ' (Workspace)' : ' (Global)'}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Wyświetl nazwę bieżącego dashboardu, gdy nie ma dropdown */}
          {availableDashboards.length <= 1 && currentDashboardId && (
            <div className="text-sm font-medium">
              {allDashboards.find(d => d.id === currentDashboardId)?.name}
            </div>
          )}
        </div>
        
        {/* Przycisk otwierający panel zarządzania dashboardami */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => usePanelStore.getState().setBottomPanelTab('dashboard')}
        >
          Manage Dashboards
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <Dashboard dashboardId={currentDashboardId} />
      </div>
    </div>
  );
};

export default WorkspaceDashboardPage;