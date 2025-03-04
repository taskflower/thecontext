// src/pages/ragnarokTasks/routes.tsx
import { RouteObject } from "react-router-dom";
import ScenariosView from "./components/ScenariosView";
import ScenarioDetailPage from "./components/details/ScenarioDetailPage";

const scenarioRoutes: RouteObject[] = [
  { index: true, element: <ScenariosView /> },
  { path: ':id', element: <ScenarioDetailPage /> },
  // { path: ':userId/view', element: <ExampleView taskId={''} /> },
  // { path: 'flow', element: <ExampleFlow/> },
];

export default scenarioRoutes;
