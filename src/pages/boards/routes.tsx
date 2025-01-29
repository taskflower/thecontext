// src/pages/boards/routes.tsx
import { RouteObject } from "react-router-dom";
import { KanbanTemplateList } from "./KanbanTemplateList";
import { KanbanTemplateNew } from "./KanbanTemplateNew";
import { KanbanTemplateEdit } from "./KanbanTemplateEdit";
import { InstancesList } from "./InstancesList";
import { KanbanViewPage } from "./KanbanViewPage";

const boardsRoutes: RouteObject[] = [
  { path: "boards/instances", element: <InstancesList /> },
  { path: "boards/templates", element: <KanbanTemplateList /> },
  { path: "boards/templates/new", element: <KanbanTemplateNew /> },
  { path: "boards/:id/edit", element: <KanbanTemplateEdit /> },
  { path: "boards/:id/view", element: <KanbanViewPage /> },
];

export default boardsRoutes;
