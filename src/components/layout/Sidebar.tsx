// components/layout/Sidebar.tsx
import React from 'react';
import WorkspacesList from '../workspaces/WorkspacesList';
import ScenariosList from '../scenarios/ScenariosList';
import NodesList from '../nodes/NodesList';
import ContextSection from '../context/ContextSection';
import useStore from '@/store';

const Sidebar: React.FC = () => {
  const view = useStore(state => state.view);
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="text-lg font-bold tracking-tight">Flow Builder</h1>
      </div>
      
      <div className="sidebar-content">
        {view === 'workspaces' && <WorkspacesList />}
        {view === 'scenarios' && <ScenariosList />}
        {(view === 'flow' || view === 'nodeEditor' || view === 'contextEditor') && <NodesList />}
      </div>
      
      {(view === 'flow' || view === 'nodeEditor' || view === 'contextEditor') && <ContextSection />}
    </div>
  );
};

export default Sidebar;