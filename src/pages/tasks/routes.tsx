import { RouteObject } from "react-router-dom";
import { TaskTemplateList } from "./TaskTemplateList";
import { TaskRunner } from "./TaskRunner";
import { TaskTemplateEdit } from "./TaskTemplateEdit";
import { TaskTemplateNew } from "./TaskTemplateNew";


const tasksRoutes: RouteObject[] = [
  { path: "templates", element: <TaskTemplateList /> },
  { path: "templates/new", element: <TaskTemplateNew /> },
  { path: ":id/edit", element: <TaskTemplateEdit /> },
  { path: ":id/run", element: <TaskRunner /> }
];

export default tasksRoutes;