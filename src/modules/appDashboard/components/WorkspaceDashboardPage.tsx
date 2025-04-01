import React, { useEffect } from 'react';
import Dashboard from './Dashboard';
import { useDashboardStore } from '../dashboardStore';
import { useAppStore } from '@/modules/store';

interface WorkspaceDashboardPageProps {
  workspaceId?: string;
  hideCreateButton?: boolean;
}

const WorkspaceDashboardPage: React.FC<WorkspaceDashboardPageProps> = ({ 
  workspaceId,
 
}) => {
  const { 
  
    getDashboardByWorkspaceId, 
    setSelectedDashboard 
  } = useDashboardStore();
  
  // Get current selected workspace ID if not provided
  const currentWorkspaceId = useAppStore(state => {
    if (workspaceId) return workspaceId;
    return state.selected.workspace;
  });
  
  // Effect to select dashboard for current workspace
  useEffect(() => {
    if (currentWorkspaceId) {
      const workspaceDashboard = getDashboardByWorkspaceId(currentWorkspaceId);
      if (workspaceDashboard) {
        setSelectedDashboard(workspaceDashboard.id);
      }
    }
  }, [currentWorkspaceId, getDashboardByWorkspaceId, setSelectedDashboard]);
  
  
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
      
      </div>
      <div className="flex-1 overflow-hidden">
        <Dashboard />
      </div>
    </div>
  );
};

export default WorkspaceDashboardPage;