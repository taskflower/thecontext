import { RouteObject } from "react-router-dom";
import { ScenarioLayout, ScenariosView } from "./components";
import ScenarioOverviewPage from "./views/ScenarioOverviewPage";
import ScenarioConnectionsPage from "./views/ScenarioConnectionsPage";
import ScenarioTasksPage from "./views/ScenarioTasksPage";


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