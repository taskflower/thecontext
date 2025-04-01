import React, { useState, useCallback } from 'react';
import { useDashboardStore } from '../dashboardStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import CreateDashboardDialog from './CreateDashboardDialog';

// Import types
import { DashboardConfig } from '../types';

interface DashboardSelectorProps {
  dashboards?: DashboardConfig[];
  filterByWorkspace?: boolean;
  hideCreateButton?: boolean;
}

const DashboardSelector: React.FC<DashboardSelectorProps> = ({
  dashboards: propDashboards,
  filterByWorkspace,
  hideCreateButton = false
}) => {
  const [isCreating, setIsCreating] = useState(false);
  
  const { 
    dashboards: storeDashboards, 
    selectedDashboardId, 
    setSelectedDashboard,
  } = useDashboardStore();
  
  // Use dashboards from props if provided, otherwise use from store
  const dashboards = propDashboards || storeDashboards;
  
  const handleChange = useCallback((value: string) => {
    setSelectedDashboard(value);
  }, [setSelectedDashboard]);
  
  const handleCreate = useCallback(() => {
    setIsCreating(true);
  }, []);
  
  const handleCloseCreate = useCallback(() => {
    setIsCreating(false);
  }, []);
  
  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedDashboardId || undefined} onValueChange={handleChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={filterByWorkspace ? "Select Workspace Dashboard" : "Select Dashboard"} />
        </SelectTrigger>
        <SelectContent>
          {dashboards.length > 0 ? (
            dashboards.map((dashboard) => (
              <SelectItem key={dashboard.id} value={dashboard.id}>
                {dashboard.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              {filterByWorkspace 
                ? "No dashboards for this workspace" 
                : "No dashboards available"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      {!hideCreateButton && (
        <Button variant="outline" size="sm" onClick={handleCreate}>
          Create
        </Button>
      )}
      
      {isCreating && (
        <CreateDashboardDialog 
          onClose={handleCloseCreate} 
          workspaceId={filterByWorkspace ? undefined : null} // Pass undefined to allow selection, null to force global
        />
      )}
    </div>
  );
};

export default DashboardSelector;