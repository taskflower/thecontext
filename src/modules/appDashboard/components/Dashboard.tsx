import React, { useState, useCallback, useEffect } from 'react';
import { useDashboardStore } from '../dashboardStore';
import DashboardWidget from './DashboardWidget';
import { Button } from '../../../components/ui/button';
import AddWidgetDialog from './AddWidgetDialog';

interface DashboardProps {
  dashboardId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ dashboardId }) => {
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  
  const { 
    dashboards,
    selectedDashboardId,
    setSelectedDashboard,
    getDashboard,
  } = useDashboardStore();
  
  // Use first dashboard if none is selected
  useEffect(() => {
    if (!selectedDashboardId && dashboards.length > 0 && !dashboardId) {
      setSelectedDashboard(dashboards[0].id);
    } else if (dashboardId && dashboardId !== selectedDashboardId) {
      setSelectedDashboard(dashboardId);
    }
  }, [dashboardId, dashboards, selectedDashboardId, setSelectedDashboard]);
  
  const currentDashboardId = dashboardId || selectedDashboardId;
  const currentDashboard = currentDashboardId ? getDashboard(currentDashboardId) : undefined;
  
  const handleAddWidget = useCallback(() => {
    setIsAddingWidget(true);
  }, []);
  
  const handleCloseAddWidget = useCallback(() => {
    setIsAddingWidget(false);
  }, []);
  
  if (!currentDashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-xl font-semibold mb-4">No Dashboard Selected</h2>
        <p className="text-gray-500 mb-4">Create a new dashboard to get started</p>
        <Button>Create Dashboard</Button>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-semibold">{currentDashboard.name}</h1>
        <Button onClick={handleAddWidget}>Add Widget</Button>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentDashboard.widgets.map((widget) => (
            <DashboardWidget 
              key={widget.id}
              widget={widget}
              dashboardId={currentDashboard.id}
            />
          ))}
        </div>
      </div>
      
      {isAddingWidget && currentDashboardId && (
        <AddWidgetDialog 
          dashboardId={currentDashboardId}
          onClose={handleCloseAddWidget}
        />
      )}
    </div>
  );
};

export default Dashboard;