// src/pages/scenarios/routes.tsx
import { RouteObject } from "react-router-dom";
import ScenariosView from "./components/ScenariosView";
import ScenarioLayout from "./components/details/ScenarioLayout";
import ScenarioOverviewPage from "./ScenarioOverviewPage";
import ScenarioTasksPage from "./ScenarioTasksPage";
import ScenarioConnectionsPage from "./ScenarioConnectionsPage";



const scenarioRoutes: RouteObject[] = [
  { index: true, element: <ScenariosView /> },
  { 
    path: ':id', 
    element: <ScenarioLayout />,
    children: [
      { index: true, element: <ScenarioOverviewPage /> },
      { path: 'tasks', element: <ScenarioTasksPage /> },
      { path: 'connections', element: <ScenarioConnectionsPage /> }
    ]
  }
];

export default scenarioRoutes;