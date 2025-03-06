// src/pages/projects/routes.tsx
import { RouteObject } from "react-router-dom";
import ProjectDetailPage from "./components/details/ProjectDetailPage";
import { ProjectsViewContainer } from "./ProjectsViewContainer";


const projectRoutes: RouteObject[] = [
  { index: true, element: <ProjectsViewContainer /> },
  { path: ':slug', element: <ProjectDetailPage /> },
];

export default projectRoutes;