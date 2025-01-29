import { RouteObject } from "react-router-dom";
import { TaskTemplateList } from "./TaskTemplateList";
import { TaskRunner } from "./TaskRunner";
import { TaskTemplateEdit } from "./TaskTemplateEdit";
import { TaskTemplateNew } from "./TaskTemplateNew";


const tasksRoutes: RouteObject[] = [
  { path: "tasks/templates", element: <TaskTemplateList /> },
  { path: "tasks/templates/new", element: <TaskTemplateNew /> },
  { path: "tasks/:id/edit", element: <TaskTemplateEdit /> },
  { path: "tasks/:id/run", element: <TaskRunner /> }
];

export default tasksRoutes;