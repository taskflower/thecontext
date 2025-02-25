// src/pages/ragnarokTasks/routes.tsx
import { RouteObject } from 'react-router-dom';
import ProjectBasedSetupPage from './ProjectBasedSetupPage';




const taskRoutes: RouteObject[] = [
  { index: true, element: <ProjectBasedSetupPage /> },
  { path: 'setup', element: <ProjectBasedSetupPage /> },
];

export default taskRoutes;