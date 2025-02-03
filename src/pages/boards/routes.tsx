// src/pages/boards/routes.tsx
import { RouteObject } from "react-router-dom";
import { KanbanTemplateList } from "./KanbanTemplateList";
import { KanbanTemplateNew } from "./KanbanTemplateNew";
import { KanbanTemplateEdit } from "./KanbanTemplateEdit";
import { InstancesList } from "./InstancesList";
import { KanbanViewPage } from "./KanbanViewPage";

const boardsRoutes: RouteObject[] = [
  { path: "instances", element: <InstancesList /> },
  { path: "templates", element: <KanbanTemplateList /> },
  { path: "templates/new", element: <KanbanTemplateNew /> },
  { path: ":id/edit", element: <KanbanTemplateEdit /> },
  { path: ":id/view", element: <KanbanViewPage /> },
];

export default boardsRoutes;
