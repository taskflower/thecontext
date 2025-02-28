// src/pages/ragnarokTasks/routes.tsx
import { RouteObject } from "react-router-dom";
import ProjectsView from "./components/ProjectsView";

const projectRoutes: RouteObject[] = [
  { index: true, element: <ProjectsView /> },
  // { path: ':userId/view', element: <TaskVisualizer taskId={''} /> },
  // { path: 'flow', element: <TaskFlow/> },
];

export default projectRoutes;
