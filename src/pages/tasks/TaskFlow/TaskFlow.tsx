import React from "react";
import { useTaskFlowStore } from "./store";

import NewProjectModal from "./projects/components/NewProjectModal";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DocumentsView from "./documents/components/DocumentsView";
import TasksView from "./tasks/components/TasksView";
import ProjectsView from "./projects/components/ProjectsView";

const TaskFlow: React.FC = () => {
  const { 
    activeTab, 
    viewMode, 
    showNewProjectModal, 
    setActiveTab, 
    setViewMode, 
    toggleNewProjectModal 
  } = useTaskFlowStore();
  
  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        toggleNewProjectModal={toggleNewProjectModal} 
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          activeTab={activeTab} 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
        
        {activeTab === "dashboard" && <ProjectsView />}
        {activeTab === "tasks" && <TasksView />}
        {activeTab === "documents" && <DocumentsView />}
      </div>
      
      {showNewProjectModal && <NewProjectModal toggleNewProjectModal={toggleNewProjectModal} />}
    </div>
  );
};

export default TaskFlow;