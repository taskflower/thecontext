// src/pages/projects/routes.tsx
import { RouteObject } from 'react-router-dom';
import ProjectBasedSetupPage from './ProjectBasedSetupPage';
import ProjectListPage from './ProjectListPage';
import ProjectDashboardPage from './ProjectDashboardPage';
import ProjectDetailPage from './ProjectDetailPage';



const projectRoutes: RouteObject[] = [
  { index: true, element: <ProjectListPage /> },
  { path: 'setup', element: <ProjectBasedSetupPage /> },
  { path: 'dashboard', element: <ProjectDashboardPage /> },
  { path: ':projectId', element: <ProjectDetailPage /> },
];

export default projectRoutes;