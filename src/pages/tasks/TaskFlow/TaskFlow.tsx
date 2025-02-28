import { initializePlugins } from "./stepsPlugins/registry";
import "./stepsPlugins/form/index"; // Bezpośredni import pluginu formularza
import { useDataStore, useUIStore } from "./store";
import { useEffect } from "react";
import DocumentsView from "./documents/components/DocumentsView";
import Header from "./Header";
import NewProjectModal from "./projects/components/NewProjectModal";
import ProjectsView from "./projects/components/ProjectsView";

import Sidebar from "./Sidebar";
import TaskListNavigator from "./tasks/components/navigator/TaskListNavigator";
import TaskNavigator from "./tasks/components/navigator/TaskNavigator";

export const TaskFlow: React.FC = () => {
  const { folders, addFolder } = useDataStore();

  const {
    activeTab,
    viewMode,
    showNewProjectModal,
    setActiveTab,
    setViewMode,
    toggleNewProjectModal,
  } = useUIStore();

  // Zmodyfikuj useEffect, aby inicjalizować pluginy
  useEffect(() => {
    // Inicjalizacja folderów
    if (!folders.find((f) => f.id === "projects")) {
      addFolder({
        id: "projects",
        name: "Projects",
        parentId: "root",
      });
    }

    // Dodaj inicjalizację pluginów
    initializePlugins()
      .then(() => console.log("Plugins initialized successfully"))
      .catch((error) => console.error("Failed to initialize plugins:", error));
  }, [folders, addFolder]);

  // Reszta komponentu pozostaje bez zmian
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
        {activeTab === "tasks" && <TaskNavigator />}
        {activeTab === "documents" && <DocumentsView />}
      </div>

      {showNewProjectModal && (
        <NewProjectModal toggleNewProjectModal={toggleNewProjectModal} />
      )}
    </div>
  );
};
export default TaskFlow;
