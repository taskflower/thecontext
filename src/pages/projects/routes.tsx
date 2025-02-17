// src/pages/projects/routes.tsx
import { RouteObject, Navigate } from "react-router-dom";
import { lazy } from "react";

const ProjectList = lazy(() => import("./ProjectList"));
const ProjectNew = lazy(() => import("./ProjectNew"));
const ProjectEdit = lazy(() => import("./ProjectEdit"));

const projectsRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="list" replace /> },
  { path: "list", element: <ProjectList /> },
  { path: "new", element: <ProjectNew /> },
  { path: ":id/edit", element: <ProjectEdit /> },
];

export default projectsRoutes;