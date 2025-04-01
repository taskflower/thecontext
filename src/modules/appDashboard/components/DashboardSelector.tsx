import React, { useState, useCallback } from 'react';
import { useDashboardStore } from '../dashboardStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import CreateDashboardDialog from './CreateDashboardDialog';

const DashboardSelector: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  
  const { 
    dashboards, 
    selectedDashboardId, 
    setSelectedDashboard,
  } = useDashboardStore();
  
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
          <SelectValue placeholder="Select Dashboard" />
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
              No dashboards available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      <Button variant="outline" size="sm" onClick={handleCreate}>
        Create
      </Button>
      
      {isCreating && (
        <CreateDashboardDialog onClose={handleCloseCreate} />
      )}
    </div>
  );
};

export default DashboardSelector;