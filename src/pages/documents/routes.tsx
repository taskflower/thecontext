// src/pages/ragnarokTasks/routes.tsx
import { RouteObject } from "react-router-dom";
import DocumentsView from "./components/DocumentsView";


const documentRoutes: RouteObject[] = [
  { index: true, element: <DocumentsView /> },
  // { path: ':userId/view', element: <TaskVisualizer taskId={''} /> },
  // { path: 'flow', element: <TaskFlow/> },
];

export default documentRoutes;
