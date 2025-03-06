// src/pages/projects/containers/ProjectsViewContainer.tsx
import { useState } from "react";
import ProjectsView from "./components/ProjectsView";

export const ProjectsViewContainer = () => {
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  return <ProjectsView viewMode={viewMode} setViewMode={setViewMode} />;
};
