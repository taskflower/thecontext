// src/pages/ragnarokTasks/routes.tsx
import { RouteObject } from 'react-router-dom';
import TaskFlow from './TaskFlow';

const taskRoutes: RouteObject[] = [
  { index: true, element: <TaskFlow /> },
  // { path: ':userId/view', element: <TaskVisualizer taskId={''} /> },
  // { path: 'flow', element: <TaskFlow/> },
];

export default taskRoutes;