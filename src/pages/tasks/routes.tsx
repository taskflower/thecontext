// src/pages/ragnarokTasks/routes.tsx
import { RouteObject } from 'react-router-dom';
import TasksPage from './TasksPage';

const taskRoutes: RouteObject[] = [
  { index: true, element: <TasksPage /> },

];

export default taskRoutes;