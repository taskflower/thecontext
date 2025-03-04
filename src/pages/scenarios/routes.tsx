// src/pages/ragnarokTasks/routes.tsx
import { RouteObject } from "react-router-dom";
import ScenariosView from "./components/ScenariosView";

const scenarioRoutes: RouteObject[] = [
  { index: true, element: <ScenariosView /> },
  // { path: ':userId/view', element: <TaskVisualizer taskId={''} /> },
  // { path: 'flow', element: <TaskFlow/> },
];

export default scenarioRoutes;
