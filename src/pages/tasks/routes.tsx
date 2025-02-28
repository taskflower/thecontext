// src/pages/ragnarokTasks/routes.tsx
import { RouteObject } from 'react-router-dom';
import TaskNavigator from './components/navigator/TaskNavigator';
import TasksBoardView from './components/kanban/TasksBoardView';


const taskRoutes: RouteObject[] = [
  { index: true, element: <TaskNavigator /> },

  { path: 'navigator', element: <TaskNavigator /> },
  { path: 'board', element: <TasksBoardView/> },
];

export default taskRoutes;