import { RouteObject, Navigate } from "react-router-dom";
import { TaskTemplateList } from "./TaskTemplateList";
import { TaskTemplateRunner } from "./TaskTemplateRunner";
import { TaskTemplateEdit } from "./TaskTemplateEdit";
import TaskTemplateNew from "./TaskTemplateNew";

const tasksRoutes: RouteObject[] = [
  { index: true, element: <Navigate to="templates" replace /> },
  { path: "templates", element: <TaskTemplateList /> },
  { path: "templates/list", element: <TaskTemplateList /> },
  { path: "templates/new", element: <TaskTemplateNew /> },
  { path: ":id/edit", element: <TaskTemplateEdit /> },
  { path: ":id/run", element: <TaskTemplateRunner /> },
];

export default tasksRoutes;
