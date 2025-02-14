import { RouteObject, Navigate } from "react-router-dom";
import { lazy } from "react";

// Lazy loaded components
const TaskTemplateList = lazy(() =>
  import("./TaskTemplateList").then((module) => ({
    default: module.TaskTemplateList,
  }))
);

const TaskTemplateRunner = lazy(() =>
  import("./TaskTemplateRunner").then((module) => ({
    default: module.TaskTemplateRunner,
  }))
);

const TaskTemplateEdit = lazy(() =>
  import("./TaskTemplateEdit").then((module) => ({
    default: module.TaskTemplateEdit,
  }))
);

const TaskTemplateNew = lazy(() => import("./TaskTemplateNew"));

const tasksRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="templates" replace /> },
  { path: "templates", element: <TaskTemplateList /> },
  { path: "templates/list", element: <TaskTemplateList /> },
  { path: "templates/new", element: <TaskTemplateNew /> },
  { path: "templates/:id/edit", element: <TaskTemplateEdit /> },
  { path: "templates/:id/run", element: <TaskTemplateRunner /> },
];

export default tasksRoutes;
